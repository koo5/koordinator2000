const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root .env file if not already loaded
const rootEnvPath = path.join(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

// Get connection string from environment variable
// Check multiple environment variable names for backward compatibility
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES || 'postgresql://localhost:5432/myapp';

// Print connection information (with password masked)
const connectionInfo = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//\\1:******@');
console.log(`[Matcher Service] Connecting to database: ${connectionInfo}`);

// Create a new pool instance
const pool = new Pool({
  connectionString
  // SSL settings are already included in the connection string via sslmode
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// Function to run migrations
async function applyMigrations() {
  const client = await pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Get list of applied migrations
    const { rows } = await client.query('SELECT name FROM migrations');
    const appliedMigrations = rows.map(row => row.name);
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir);
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    // Apply new migrations
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Applying migration: ${file}`);
        const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // Start a transaction for the migration
        await client.query('BEGIN');
        try {
          await client.query(migration);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration ${file} applied successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('All migrations applied successfully');
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  applyMigrations
};
