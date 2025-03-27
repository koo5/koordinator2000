#!/usr/bin/env node

/**
 * Database baseline script for Koordinator2000
 * 
 * This script marks the initial schema migration as already applied
 * without actually executing the SQL. Use this when you have an existing
 * database schema and want to start tracking migrations from this point forward.
 */

const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./client');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Turn off strict TLS checking for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function baseline() {
  console.log('Initializing baseline for existing database schema...');
  
  // Initialize database connection
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
    
    // Check if initial migration is already registered
    const { rows } = await client.query(
      'SELECT * FROM migrations WHERE name = $1',
      ['20250326000000_initial_schema.sql']
    );
    
    // If initial migration is not registered, add it
    if (rows.length === 0) {
      console.log('Marking initial schema migration as applied...');
      await client.query(
        'INSERT INTO migrations (name, version, applied_at) VALUES ($1, $2, NOW())',
        ['20250326000000_initial_schema.sql', '20250326000000']
      );
      console.log('Initial schema migration marked as applied.');
    } else {
      console.log('Initial schema migration is already marked as applied.');
    }
    
    console.log('Baseline completed successfully.');
  } catch (error) {
    console.error('Baseline operation failed:', error);
    throw error;
  } finally {
    client.release();
    await db.close();
  }
}

if (require.main === module) {
  baseline().catch(err => {
    console.error('Baseline failed:', err);
    process.exit(1);
  });
}

module.exports = { baseline };