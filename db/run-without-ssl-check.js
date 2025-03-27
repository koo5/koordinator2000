#!/usr/bin/env node

/**
 * This script temporarily disables SSL certificate validation
 * and runs the database deployment.
 */

// Set environment variable to disable certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import and run the deployment
const { deploy } = require('./deploy');

console.log('Running deployment with SSL certificate validation disabled');
console.log(`NODE_TLS_REJECT_UNAUTHORIZED=${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);

deploy().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
