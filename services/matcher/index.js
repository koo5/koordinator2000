require('dotenv').config();
const { applyMigrations } = require('./db');

async function main() {
  try {
    console.log('Starting application...');
    
    // Apply service-specific database migrations
    console.log('Applying service-specific migrations...');
    await applyMigrations();
    
    // Start your application logic here
    console.log('Application started successfully');
    
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

main();