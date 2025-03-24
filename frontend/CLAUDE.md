# Koordinator Frontend Development Guide

## Development Commands
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Start Production Server**: `npm start`

## Environment Setup
Create a `.env` file in the project root with these required variables:

```
# GraphQL endpoint for Hasura
PUBLIC_GRAPHQL_ENDPOINT="https://your-hasura-instance.hasura.app/v1/graphql"
PUBLIC_URL="http://localhost:5000"
PUBLIC_BASE_URL="/"

# Hasura GraphQL Headers with Admin Secret
PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json","x-hasura-admin-secret":"your-hasura-admin-secret"}'

# App keys - generate using generate_key_pair.mjs
# This should be a server-side environment variable - NOT public!
MY_APP_KEYS='{"private":{...},"public":{...}}'
```

To generate the keys, run:
```
node generate_key_pair.mjs
```

## Configuration Structure

The application uses a two-tier configuration system:

1. **lib/env.js**: Basic environment handling
   - Imports environment variables from SvelteKit's `$env/static/public`
   - Provides fallback values for essential variables
   - Exports simple values without complex parsing
   - Used primarily for URLs and endpoint locations

2. **config.js**: Application configuration
   - Imports and extends values from env.js
   - Imports private environment variables from `$env/static/private`
   - Handles JSON parsing for structured data like headers and keys
   - Centralizes all configuration into a single exported object
   - Used by components that need the full configuration

### Environment Variable Security

This application follows SvelteKit's environment variable conventions:

- **Public variables** (`$env/static/public`): Start with `PUBLIC_` prefix
  - Available in both server and client code
  - Safe to expose to browsers
  - Example: `PUBLIC_GRAPHQL_ENDPOINT`, `PUBLIC_GRAPHQL_HEADERS`

- **Private variables** (`$env/static/private`): No `PUBLIC_` prefix
  - Only available in server-side code
  - Never exposed to browsers
  - Used for secrets like private keys
  - Example: `MY_APP_KEYS` containing JWT signing private keys
  
#### Security Implementation

Private keys are handled securely through strict requirements:

1. **Mandatory MY_APP_KEYS**: The application will not start without valid MY_APP_KEYS
2. **Server-side only**: Private keys (MY_APP_KEYS) are ONLY used in server-side code
3. **No client exposure**: Private keys are never sent to the client
4. **API-based auth**: Client code calls server APIs for authentication operations
5. **No client-side defaults**: No sensitive data in client-accessible code
6. **Strict validation**: Keys are validated at startup to ensure proper format

⚠️ **IMPORTANT**: MY_APP_KEYS is a CRITICAL security component:
- The server will refuse to start if MY_APP_KEYS is missing or invalid
- This environment variable MUST be properly set in production environments
- No defaults are provided for this sensitive data
- JWT authentication will completely fail without this key

## Hasura Integration
This application uses Hasura Cloud for GraphQL:

1. Get your Hasura admin secret from Hasura Cloud dashboard:
   - Go to your project in [Hasura Cloud](https://cloud.hasura.io)
   - Navigate to "Project Settings" > "API Access"
   - Copy or generate an admin secret

2. Add the admin secret to your .env file:
   ```
   PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json","x-hasura-admin-secret":"your-secret-here"}'
   ```

3. For production, consider using role-based headers instead:
   ```
   PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json","x-hasura-role":"user","x-hasura-user-id":"${userId}"}'
   ```

## Migration Status
This project has been fully migrated from Sapper to SvelteKit. All routes are now in the SvelteKit file-based routing format:
- Page components use `+page.svelte` files in route directories
- Data loading is handled in separate `+page.js` files
- API endpoints use `+server.js` files with HTTP method handlers
- Layouts are defined in `+layout.svelte` files

When working with this codebase:
- Use SvelteKit conventions for all new code
- Use `browser` from `$app/environment` instead of `process.browser`
- Use relative import paths using `../` for parent directories
- Use SvelteKit's imports for navigation:
  - `import { goto } from '$app/navigation'`
  - `import { page } from '$app/stores'`

## Architecture
- The frontend uses a GraphQL endpoint provided by Hasura
- Access control logic (ACL) should be handled by Hasura
- Hasura is configured to use a Postgres instance, database schema dump is in ../data/koordinator.sql
- SSR-safe code must check for browser environment before accessing browser APIs

## Code Style Guidelines
- **Framework**: SvelteKit application using client-side rendering
- **Modules**: Use ES modules with `.js` extension
- **Imports**: Prefer relative imports (`../`) or alias imports (`$lib/`)
- **Component Files**: Use `.svelte` extension with PascalCase naming
- **Variables/Functions**: Use snake_case for variables and functions
- **Documentation**: Use JSDoc comments for functions (see jsdoc-template.js)
- **Error Handling**: Use try/catch blocks with console.error for error logging
- **Store Pattern**: Use Svelte stores and shared local storage stores
- **TypeScript**: Use TypeScript with at least noImplicitAny and strictNullChecks
- **Type Definitions**: Define types in app.d.ts or types.d.ts
- **Navigation**: Use SvelteKit's imports from `$app/navigation` for navigation
- **Environment**: Use `browser` from `$app/environment` (not process.browser)
- **Authentication**: Custom auth implementation with Auth0 integration
- **GraphQL**: Apollo client for data fetching

## SvelteKit Conventions
- Pages use `+page.svelte` and `+page.js` files in route directories
- Use `data-sveltekit-preload-data` for link prefetching (not rel=prefetch)
- Server endpoints use `+server.js` files with HTTP method exports
- Layout components use `+layout.svelte` files
- Error pages use `+error.svelte` files
- Load data with `load` functions in `+page.js` or `+page.server.js`

## Utility Libraries
This project includes several utility libraries in the `$lib` directory:
- **route-utils.js**: Navigation, route handling, and API loading
- **data-utils.js**: Data fetching with automatic error handling
- **form-utils.js**: Form state management and validation
- **error-utils.js**: Standardized error handling
- **storage-utils.js**: Enhanced localStorage/sessionStorage
- **utils.js**: Main export file that includes all utilities

Import these utilities with: `import { functionName } from '$lib/utils'`

## Browser-Only Components
Components like FirepadEditor that use browser-only APIs need special handling:
- Use dynamic imports for browser-only modules
- Use `browser` check before initializing browser-only features
- Handle errors gracefully during SSR