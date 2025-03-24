import { browser } from '$app/environment';

// Default configuration with fallbacks to prevent undefined errors
let config = {
  GRAPHQL_ENDPOINT: 'localhost:8080/v1/graphql',
  PUBLIC_GRAPHQL_HEADERS: {},
  MY_APP_KEYS: {
    "private": {
      "kty": "EC",
      "crv": "P-256",
      "alg": "ES256",
      "x": "placeholder",
      "y": "placeholder",
      "d": "placeholder"
    },
    "public": {
      "kty": "EC",
      "crv": "P-256",
      "alg": "ES256",
      "x": "placeholder",
      "y": "placeholder"
    }
  }
};

if (!browser) {  // Check for server-side environment
  // Use dynamic imports for server-side only dependencies
  try {
    // Use top-level await with dynamic imports
    const importDotenv = async () => {
      const dotenv = await import('dotenv');
      const dotenvExpand = await import('dotenv-expand');
      
      const myEnv = dotenv.default.config();
      dotenvExpand.default(myEnv);
      
      if (myEnv.parsed) {
        myEnv.parsed.PUBLIC_GRAPHQL_HEADERS = JSON.parse(myEnv.parsed.PUBLIC_GRAPHQL_HEADERS || '{}');
        myEnv.parsed.MY_APP_KEYS = JSON.parse(myEnv.parsed.MY_APP_KEYS || '{}');
        config = myEnv.parsed;
      }
    };
    
    // Execute the async function
    importDotenv();
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Use ESM export syntax
export { config }
