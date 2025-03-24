/**
 * Server-only environment configuration
 * This file should never be imported in client-side code
 */

// Import server-side environment variables
import { HASURA_ADMIN_SECRET, MY_APP_KEYS } from '$env/static/private';
import { public_env } from '$lib/public_env.js';

// Parse JSON configuration for MY_APP_KEYS - this must be provided
let parsedKeys;
try {
  if (!MY_APP_KEYS) {
    throw new Error('MY_APP_KEYS environment variable is missing');
  }
  parsedKeys = JSON.parse(MY_APP_KEYS);
  if (!parsedKeys || !parsedKeys.private || !parsedKeys.public) {
    throw new Error('MY_APP_KEYS must contain both private and public key objects');
  }
} catch (error) {
  console.error('CRITICAL ERROR: Invalid MY_APP_KEYS:', error);
  throw error; // Re-throw to prevent application from starting with invalid keys
}

// Server-side only environment configuration
export const server_env = {
  // Include public environment variables
  ...public_env,
  
  // Private environment variables (server-side only)
  HASURA_ADMIN_SECRET,
  MY_APP_KEYS: parsedKeys,
  
  // Override the public GraphQL headers with admin secret for server-side requests
  PUBLIC_GRAPHQL_HEADERS: {
    'content-type': 'application/json',
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    ...public_env.PUBLIC_GRAPHQL_HEADERS
  }
};
