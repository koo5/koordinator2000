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

  // Decide whether to use SSL. A local Postgres (our Docker container, or any
  // localhost instance) speaks plaintext and will refuse an SSL handshake, so
  // forcing SSL there breaks the connection. Managed providers (Aiven, etc.)
  // require it. Rule: disable SSL for localhost / sslmode=disable, else keep it
  // (with relaxed cert checking, matching the previous behaviour).
  const isLocal = /@(localhost|127\.0\.0\.1|postgres|::1)[:/]/.test(connectionString)
    || /[?&]sslmode=disable/.test(connectionString)
    || process.env.DATABASE_SSL === 'disable';

  // Create a new pool instance
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false }
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