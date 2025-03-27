const fs = require('fs');
const path = require('path');
const { pool } = require('./index');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('file', {
    alias: 'f',
    describe: 'Specific seed file to run',
    type: 'string'
  })
  .help()
  .argv;

async function seed() {
  const client = await pool.connect();
  
  try {
    // Create seeds table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Get list of applied seeds
    const { rows } = await client.query('SELECT name FROM seeds');
    const appliedSeeds = rows.map(row => row.name);
    
    // Get seed files
    const seedsDir = path.join(__dirname, 'seeds');
    if (!fs.existsSync(seedsDir)) {
      fs.mkdirSync(seedsDir, { recursive: true });
    }
    
    let seedFiles;
    
    if (argv.file) {
      // Run a specific seed file
      if (fs.existsSync(path.join(seedsDir, argv.file))) {
        seedFiles = [argv.file];
      } else {
        console.error(`Seed file not found: ${argv.file}`);
        return;
      }
    } else {
      // Run all seed files
      seedFiles = fs.readdirSync(seedsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to ensure seeds run in order
    }
    
    // Apply seeds
    for (const file of seedFiles) {
      // Skip if this seed has already been applied
      if (appliedSeeds.includes(file) && !argv.file) {
        console.log(`Seed already applied: ${file}`);
        continue;
      }
      
      console.log(`Applying seed: ${file}`);
      const seedSql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
      
      // Start a transaction for the seed
      await client.query('BEGIN');
      try {
        await client.query(seedSql);
        
        // Only record in seeds table if it's not a forced re-run
        if (!argv.file || !appliedSeeds.includes(file)) {
          await client.query('INSERT INTO seeds (name) VALUES ($1)', [file]);
        }
        
        await client.query('COMMIT');
        console.log(`Seed ${file} applied successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying seed ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('All seeds applied successfully');
  } finally {
    client.release();
  }
  
  // Close the pool
  await pool.end();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});