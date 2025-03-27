/**
 * Database client for Koordinator2000
 * 
 * Handles database connection and provides query interface
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Initialize database connection
 * @returns {Object} Database client with connection pool and query methods
 */
async function initDatabase() {
  // Get connection string from environment variable
  // Check multiple environment variable names for backward compatibility
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES || 'postgresql://localhost:5432/koordinator';

  // Print connection information (with password masked)
  const connectionInfo = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//\\1:******@');
  console.log(`Connecting to database: ${connectionInfo}`);

  // Create a new pool instance
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Ignore SSL certificate validation errors
    }
  });

  // Test the connection
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  } catch (err) {
    console.error('Database connection error:', err.message);
    throw err; // Re-throw to allow caller to handle
  }

  // Return client interface
  return {
    pool,
    query: (text, params) => pool.query(text, params),
    close: async () => {
      console.log('Closing database connection pool');
      await pool.end();
    }
  };
}

module.exports = { initDatabase };