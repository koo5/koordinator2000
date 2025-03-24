export const env = {
  GRAPHQL_ENDPOINT: import.meta.env.VITE_PUBLIC_GRAPHQL_ENDPOINT,
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL,
  PUBLIC_BASE_URL: import.meta.env.VITE_PUBLIC_BASE_URL
};

// Helper function to get API URL
export function getApiUrl(path) {
  return `${env.PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
