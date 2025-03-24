// Environment variable handling for SvelteKit
import { browser } from '$app/environment';

// Try importing environment variables from SvelteKit, with fallbacks in try/catch
let importedEndpoint, importedUrl, importedBaseUrl;

// Fallback values for environment variables
const defaults = {
  GRAPHQL_ENDPOINT: 'localhost:8080/v1/graphql',
  PUBLIC_URL: 'http://localhost:5000',
  PUBLIC_BASE_URL: '/'
};

// Safe import approach - allows code to work even if env vars are missing
try {
  const envVars = browser ? import.meta.env : process.env;
  importedEndpoint = envVars.PUBLIC_GRAPHQL_ENDPOINT;
  importedUrl = envVars.PUBLIC_URL;
  importedBaseUrl = envVars.PUBLIC_BASE_URL;
} catch (e) {
  console.warn('Error importing environment variables, using defaults', e);
}

// Export environment variables with fallbacks
export const env = {
  GRAPHQL_ENDPOINT: importedEndpoint || defaults.GRAPHQL_ENDPOINT, // Single endpoint
  PUBLIC_URL: importedUrl || defaults.PUBLIC_URL,
  PUBLIC_BASE_URL: importedBaseUrl || defaults.PUBLIC_BASE_URL
};

// Helper function to get API URL
export function getApiUrl(path) {
  return `${env.PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
