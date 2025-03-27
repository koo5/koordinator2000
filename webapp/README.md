
# Koordinator Frontend

#### Demo: https://fullcracy.xyz/

## Local Setup

1. Install dependencies:
```
npm i
```

2. Create an `.env` file with the following variables:
```
GRAPHQL_ENDPOINT="https://your-hasura-instance.hasura.app/v1/graphql"
PUBLIC_URL="http://localhost:5000"
PUBLIC_BASE_URL="/"

# Hasura GraphQL Headers - generate Admin Secret in Hasura Cloud
PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json","x-hasura-admin-secret":"your-hasura-admin-secret"}'

# App keys - generate using node generate_key_pair.mjs
# REQUIRED: This is a server-side secret that must be set (not optional!)
# The application will not start without this environment variable
MY_APP_KEYS='{"private":{"kty":"EC","crv":"P-256","alg":"ES256","x":"...","y":"...","d":"..."},"public":{"kty":"EC","crv":"P-256","alg":"ES256","x":"...","y":"..."}}'
```

3. Generate JWT keys (if needed):
```
node generate_key_pair.mjs
```
Copy the output to PUBLIC_MY_APP_KEYS in your .public_env file.

4. Start the development server:
```
npm run dev
```

## Hasura Cloud Setup

To obtain the required Hasura headers:

1. Login to [Hasura Cloud](https://cloud.hasura.io)
2. Navigate to your project
3. Go to "Project Settings" > "API Access"
4. Generate or copy your Admin Secret
5. Add the Admin Secret to your .public_env file in the PUBLIC_GRAPHQL_HEADERS variable as shown above

For production environments, consider using more restricted permissions with x-hasura-role headers.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server

See CLAUDE.md for more detailed development guidelines.

