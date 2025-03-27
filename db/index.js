/**
 * Database module for Koordinator2000
 * 
 * This is a convenience module that initializes the database client.
 * For direct access to the client initialization, use client.js instead.
 */

const { initDatabase } = require('./client');

// Initialize database connection immediately for backward compatibility
let pool, query;

// Create synchronized initialization that will be complete by the time
// other modules can import and use this one
(async () => {
  try {
    const client = await initDatabase();
    pool = client.pool;
    query = client.query;
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

module.exports = {
  pool: () => pool, // Return as function to ensure it's initialized
  query: async (text, params) => {
    if (!query) {
      throw new Error('Database not initialized yet');
    }
    return query(text, params);
  }
};