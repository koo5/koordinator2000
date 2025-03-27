/**
 * Database migration script for Koordinator2000
 */

const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./client');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('to', {
    alias: 't',
    describe: 'Migrate to a specific version',
    type: 'string'
  })
  .help()
  .argv;

/**
 * Run database migrations
 */
async function migrate() {
  console.log('Starting migration process...');
  
  // Initialize the database connection
  const db = await initDatabase();
  const client = await db.pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(14) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Get list of applied migrations
    const { rows } = await client.query('SELECT name, version FROM migrations ORDER BY version ASC');
    const appliedMigrations = rows.map(row => row.name);
    const latestAppliedVersion = rows.length > 0 ? rows[rows.length - 1].version : '00000000000000';
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    let targetVersion = argv.to || '99999999999999'; // Default to far-future date
    
    // Apply new migrations
    for (const file of migrationFiles) {
      const version = file.substring(0, 14); // Extract timestamp from filename
      
      // Skip if this migration has already been applied
      if (appliedMigrations.includes(file)) {
        continue;
      }
      
      // Skip if this migration is beyond our target version
      if (version > targetVersion) {
        continue;
      }
      
      // Skip if this migration is before the latest applied migration
      // (prevents out-of-order migrations)
      if (version < latestAppliedVersion) {
        console.warn(`Skipping migration ${file} as it's older than the latest applied migration`);
        continue;
      }
      
      console.log(`Applying migration: ${file}`);
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Start a transaction for the migration
      await client.query('BEGIN');
      try {
        await client.query(migration);
        await client.query('INSERT INTO migrations (name, version) VALUES ($1, $2)', [file, version]);
        await client.query('COMMIT');
        console.log(`Migration ${file} applied successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('All migrations applied successfully');
  } finally {
    client.release();
  }
  
  // Close the pool
  await db.close();
}

// Run migrations if this script is executed directly
if (require.main === module) {
  migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

// Export for use in other scripts
module.exports = { migrate };