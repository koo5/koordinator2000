// Environment variable handling for SvelteKit
import { PUBLIC_GRAPHQL_ENDPOINT, PUBLIC_URL, PUBLIC_BASE_URL } from '$env/static/public';

export const env = {
  PUBLIC_GRAPHQL_ENDPOINT: PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql',
  PUBLIC_URL: PUBLIC_URL || 'http://localhost:5000',
  PUBLIC_BASE_URL: PUBLIC_BASE_URL || '/'
};
