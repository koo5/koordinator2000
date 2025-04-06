require('dotenv').config();
const matcher = require('./participation_matcher.js')

const { applyMigrations } = require('./db');

async function main() {
  try {
    console.log('Starting application...');

    // Apply service-specific database migrations
    console.log('Applying service-specific migrations...');
    await applyMigrations();

    await matcher.run();

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Application shutting down...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

await main();
