let config = {}

if (typeof window === 'undefined') {  // Better check for server-side than !process.browser
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
