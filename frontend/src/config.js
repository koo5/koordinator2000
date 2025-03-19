let config = {}

if (typeof window === 'undefined') {  // Better check for server-side than !process.browser
  const dotenv = require('dotenv')
  const myEnv = dotenv.config()
  const dotenvExpand = require('dotenv-expand')
  dotenvExpand(myEnv)
  
  if (myEnv.parsed) {
    myEnv.parsed.PUBLIC_GRAPHQL_HEADERS = JSON.parse(myEnv.parsed.PUBLIC_GRAPHQL_HEADERS || '{}')
    myEnv.parsed.MY_APP_KEYS = JSON.parse(myEnv.parsed.MY_APP_KEYS || '{}')
    config = myEnv.parsed
  }
}

// Use ESM export syntax
export { config }
