import { browser } from '$app/environment';
import { env } from '$lib/env';

// Configuration with no fallbacks - environment variables are required
export const config = {
  // Use the GRAPHQL_ENDPOINT values from env.js - no fallbacks
  GRAPHQL_ENDPOINT: env.GRAPHQL_ENDPOINT,
  PUBLIC_GRAPHQL_HEADERS: JSON.parse(import.meta.env.VITE_PUBLIC_GRAPHQL_HEADERS)
};

// Only try to load MY_APP_KEYS on the server side
// Frontend code should never directly use these keys
if (!browser) {
  // MY_APP_KEYS will be verified in hooks.server.js
  // The application will not start if MY_APP_KEYS is missing
  console.log('Server-side config initialized');
}

