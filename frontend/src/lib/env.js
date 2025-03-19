// Environment variable handling for SvelteKit
import { PUBLIC_GRAPHQL_ENDPOINT, PUBLIC_URL, PUBLIC_BASE_URL } from '$env/static/public';

// Fallback values for environment variables
const defaults = {
  PUBLIC_GRAPHQL_ENDPOINT: 'http://localhost:8080/v1/graphql',
  PUBLIC_URL: 'http://localhost:5000',
  PUBLIC_BASE_URL: '/'
};

// Export environment variables with fallbacks
export const env = {
  PUBLIC_GRAPHQL_ENDPOINT: PUBLIC_GRAPHQL_ENDPOINT || defaults.PUBLIC_GRAPHQL_ENDPOINT,
  PUBLIC_URL: PUBLIC_URL || defaults.PUBLIC_URL,
  PUBLIC_BASE_URL: PUBLIC_BASE_URL || defaults.PUBLIC_BASE_URL
};

// Helper function to get API URL
export function getApiUrl(path) {
  return `${env.PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
