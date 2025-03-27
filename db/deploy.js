#!/usr/bin/env node

/**
 * Database deployment script for Koordinator2000
 * 
 * This script handles running migrations as a separate process.
 * It's intended to be used in deployment pipelines or before starting services.
 */

const path = require('path');
const fs = require('fs');

// Load environment variables first
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`Loaded environment from ${envPath}`);
} else {
  console.log('No .env file found, using environment variables from system');
}

const { migrate } = require('./migrate');

/**
 * Deploy database changes
 */
async function deploy() {
  try {
    console.log('Starting database deployment...');
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    
    // Run migrations
    await migrate();
    
    console.log('Database deployment completed successfully.');
  } catch (error) {
    console.error('Database deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment if this script is executed directly
if (require.main === module) {
  deploy();
}

module.exports = { deploy };