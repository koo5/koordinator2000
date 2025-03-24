import { browser } from '$app/environment';
import { env } from '$lib/env';

// Default headers with content-type
const defaultHeaders = {
  'content-type': 'application/json'
};

// Try to get headers from environment
let graphqlHeaders = defaultHeaders;

// Safe environment variable access
try {
  if (browser) {
    // In browser, try using import.meta.env
    if (import.meta.env?.PUBLIC_GRAPHQL_HEADERS) {
      graphqlHeaders = JSON.parse(import.meta.env.PUBLIC_GRAPHQL_HEADERS);
    }
  } else {
    // In server, try using process.env or require
    if (process.env?.PUBLIC_GRAPHQL_HEADERS) {
      graphqlHeaders = JSON.parse(process.env.PUBLIC_GRAPHQL_HEADERS);
    }
  }
} catch (e) {
  console.warn('Error parsing GRAPHQL_HEADERS, using defaults', e);
}

// Default configuration with fallbacks to prevent undefined errors
export const config = {
  // Use the single GRAPHQL_ENDPOINT from env.js
  GRAPHQL_ENDPOINT: env.GRAPHQL_ENDPOINT,
  
  // Use parsed headers or defaults
  PUBLIC_GRAPHQL_HEADERS: graphqlHeaders
};

// Only try to load MY_APP_KEYS on the server side
// Frontend code should never directly use these keys
if (!browser) {
  // MY_APP_KEYS will be verified in hooks.server.js
  // The application will not start if MY_APP_KEYS is missing
  console.log('Server-side config initialized');
}

