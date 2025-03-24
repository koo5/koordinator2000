export const public_env = {
  GRAPHQL_ENDPOINT: import.meta.env.VITE_PUBLIC_GRAPHQL_ENDPOINT,
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL,
  PUBLIC_BASE_URL: import.meta.env.VITE_PUBLIC_BASE_URL,
  // Parse Hasura headers from environment
  PUBLIC_GRAPHQL_HEADERS: (() => {
    try {
      return JSON.parse(import.meta.env.VITE_PUBLIC_GRAPHQL_HEADERS || '{"content-type":"application/json"}');
    } catch (e) {
      console.error("Error parsing VITE_PUBLIC_GRAPHQL_HEADERS:", e);
      return {"content-type": "application/json"};
    }
  })()
};

// Helper function to get API URL
export function getApiUrl(path) {
  return `${public_env.PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
