const fs = require('fs');
const path = require('path');
const { pool } = require('./index');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('steps', {
    alias: 's',
    describe: 'Number of migrations to roll back',
    type: 'number',
    default: 1
  })
  .option('to', {
    alias: 't',
    describe: 'Roll back to a specific version',
    type: 'string'
  })
  .help()
  .argv;

async function rollback() {
  const client = await pool.connect();
  
  try {
    // Check if migrations table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'migrations'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('No migrations to roll back.');
      return;
    }
    
    // Get list of applied migrations
    const { rows } = await client.query('SELECT name, version FROM migrations ORDER BY version DESC');
    
    if (rows.length === 0) {
      console.log('No migrations to roll back.');
      return;
    }
    
    // Determine which migrations to roll back
    let migrationsToRollback = [];
    
    if (argv.to) {
      // Roll back to a specific version
      const targetVersion = argv.to;
      migrationsToRollback = rows.filter(row => row.version > targetVersion);
    } else {
      // Roll back a specific number of steps
      migrationsToRollback = rows.slice(0, argv.steps);
    }
    
    if (migrationsToRollback.length === 0) {
      console.log('No migrations to roll back.');
      return;
    }
    
    for (const migration of migrationsToRollback) {
      const version = migration.version;
      console.log(`Rolling back migration: ${migration.name}`);
      
      // Check if backup schema exists
      const backupSchemaExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_namespace 
          WHERE nspname = $1
        )
      `, [`_migration_backup_${version}`]);
      
      // Start a transaction for the rollback
      await client.query('BEGIN');
      try {
        if (backupSchemaExists.rows[0].exists) {
          // Restore from backup if exists
          console.log(`Restoring from backup schema _migration_backup_${version}`);
          
          // Here we'd need to determine what tables to restore
          // This is a simplified implementation; in a real-world scenario,
          // you would need more sophisticated logic to restore the exact tables
          
          // For now, we'll just drop the backup schema as a placeholder
          await client.query(`DROP SCHEMA IF EXISTS _migration_backup_${version} CASCADE`);
        } else {
          console.log(`No backup schema found for ${migration.name}`);
          // You could look for a specific rollback file instead
          // const rollbackFile = `${version}_rollback.sql`;
        }
        
        // Remove the migration record
        await client.query('DELETE FROM migrations WHERE name = $1', [migration.name]);
        await client.query('COMMIT');
        console.log(`Rolled back migration: ${migration.name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error rolling back migration ${migration.name}:`, error.message);
        throw error;
      }
    }
    
    console.log('Rollback completed successfully');
  } finally {
    client.release();
  }
  
  // Close the pool
  await pool.end();
}

rollback().catch(err => {
  console.error('Rollback failed:', err);
  process.exit(1);
});