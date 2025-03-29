# Koordinator Frontend Development Guide

## Development Commands
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Start Production Server**: `npm start`
- **TypeScript Check**: `npm run typecheck`

## Environment Setup
Create a `.env` file in the project root with these required variables:

```
# GraphQL endpoint for Hasura (MUST have VITE_ prefix for client access)
VITE_PUBLIC_GRAPHQL_ENDPOINT="your-hasura-instance.hasura.app/v1/graphql"
VITE_PUBLIC_URL="http://localhost:5000"
VITE_PUBLIC_BASE_URL="/"

# Hasura GraphQL Headers with Admin Secret
VITE_PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json","x-hasura-admin-secret":"your-hasura-admin-secret"}'

# Optional Keycloak integration (set to 'true' to enable)
VITE_PUBLIC_ENABLE_KEYCLOAK="false"

# App keys - generate using generate_key_pair.mjs
# This should be a server-side environment variable - NOT public!
MY_APP_KEYS='{"private":{...},"public":{...}}'
```

⚠️ **IMPORTANT**: SvelteKit with Vite requires client-accessible environment variables to have the `VITE_` prefix. Variables without this prefix will only be available server-side.

To generate the keys, run:
```
node generate_key_pair.mjs
```

## Configuration Structure

The application uses a two-tier configuration system:

1. **lib/public_env.js**: Basic environment handling
   - Imports environment variables from SvelteKit's `$public_env/static/public`
   - Provides fallback values for essential variables
   - Exports simple values without complex parsing
   - Used primarily for URLs and endpoint locations

2. **private_env.js**: Application configuration
   - Imports and extends values from public_env.js
   - Imports private environment variables from `$public_env/static/private`
   - Handles JSON parsing for structured data like headers and keys
   - Centralizes all configuration into a single exported object
   - Used by components that need the full configuration

### Environment Variable Security

This application follows SvelteKit's environment variable conventions with Vite:

- **Public variables**: Must start with `VITE_` prefix
  - Available in both server and client code via `import.meta.public_env`
  - Safe to expose to browsers
  - Example: `VITE_PUBLIC_GRAPHQL_ENDPOINT`, `VITE_PUBLIC_GRAPHQL_HEADERS`

- **Private variables**: No `VITE_` prefix
  - Only available in server-side code via `$public_env/static/private`
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
- This environment variable MUST be properly set
- No defaults are provided for this sensitive data
- JWT authentication will completely fail without this key

## Hasura Integration
This application uses Hasura Cloud for GraphQL:

1. Get your Hasura admin secret from Hasura Cloud dashboard:
   - Go to your project in [Hasura Cloud](https://cloud.hasura.io)
   - Navigate to "Project Settings" > "API Access"
   - Copy or generate an admin secret

2. Add the admin secret to your .env file.

## when working with this codebase:
- Use SvelteKit conventions for all new code
- Use `browser` from `$app/environment` instead of `process.browser`
- Use relative import paths using `../` for parent directories
- Use SvelteKit's imports for navigation:
  - `import { goto } from '$app/navigation'`
  - `import { page } from '$app/stores'`

## Architecture
- The frontend uses a GraphQL endpoint provided by Hasura
- Access control logic (ACL) should be handled by Hasura using the JWT token stored in local storage
- Hasura is configured to use a Postgres instance, database schema dump is in ../data/koordinator.sql

## Code Style Guidelines
- **Framework**: SvelteKit application using client-side rendering
- **Modules**: Use ES modules with `.ts` extension for TypeScript files
- **Imports**: Prefer relative imports (`../`) or alias imports (`$lib/`)
- **Component Files**: Use `.svelte` extension with PascalCase naming
- **Variables/Functions**: Use snake_case for variables and functions
- **Documentation**: Use TypeScript-compatible JSDoc comments for functions
- **Error Handling**: Use try/catch blocks with console.error for error logging
- **Store Pattern**: Use strongly-typed Svelte stores and shared local storage stores
- **TypeScript**: All new code should be written in TypeScript
- **Type Definitions**: Define types inline, in module files, or in app.d.ts and types.d.ts
- **Navigation**: Use SvelteKit's imports from `$app/navigation` for navigation
- **Environment**: Use `browser` from `$app/environment` (not process.browser)
- **Authentication**: Custom auth implementation with Auth0 integration
- **GraphQL**: URQL client for data fetching with TypeScript support

## SvelteKit Conventions
- Pages use `+page.svelte` and `+page.js` files in route directories
- Use `data-sveltekit-preload-data` for link prefetching (not rel=prefetch)
- Server endpoints use `+server.js` files with HTTP method exports
- Layout components use `+layout.svelte` files
- Error pages use `+error.svelte` files
- Load data with `load` functions in `+page.js` or `+page.server.js`

## Utility Libraries
This project includes several utility libraries in the `$lib` directory:
- **route-utils.ts**: Navigation, route handling, and API loading
- **data-utils.ts**: Data fetching with automatic error handling
- **form-utils.ts**: Form state management and validation
- **error-utils.ts**: Standardized error handling
- **storage-utils.ts**: Enhanced localStorage/sessionStorage
- **utils.ts**: Main export file that includes all utilities
- **public_env.ts**: Environment variable management
- **urql.ts**: GraphQL client configuration

Import these utilities with: `import { functionName } from '$lib/utils'`

## Browser-Only Components
Components like FirepadEditor that use browser-only APIs need special handling:
- Use dynamic imports for browser-only modules
- Use `browser` check before initializing browser-only features
- Handle errors gracefully during SSR

## TypeScript Migration
This project is undergoing migration from JavaScript to TypeScript:

### Completed Conversions:
- Core utility libraries in `$lib` directory:
  - `utils.ts`
  - `route-utils.ts`
  - `data-utils.ts`
  - `error-utils.ts`
  - `form-utils.ts`
  - `storage-utils.ts`
  - `version-check.ts`
  - `public_env.ts`
  - `urql.ts`
  - `fetch-utils.ts`
  - `auth.ts` (was already TypeScript)
  - `stores.ts`
  - `auth-utils.ts`
  - `empty-module.ts`
  - `empty-polyfill.ts`
- Server-side libraries in `$lib/server` directory:
  - `env.ts`
  - `urql.ts`
  - `auth.ts`
  - `keycloak.ts`
  - `keycloak-auth.ts`
- Client-side libraries in `$lib/client` directory:
  - `auth.ts`
- Utility modules in `src`:
  - `svelte-shared-store.ts`
  - `event_dispatcher.ts`
  - `browser_theme_setting.ts`

### Migration Guidelines:
1. **File Extensions**: Rename `.js` to `.ts` when converting
2. **Type Annotations**: Add explicit types to function parameters and return values
3. **Interfaces**: Define interfaces for complex data structures
4. **Generics**: Use generics for reusable functions
5. **Type Assertions**: Use `as` for type assertions when necessary
6. **TypeScript-compatible JSDoc**: Update JSDoc comments to work with TypeScript
7. **Import Types**: Use `import type` for type-only imports

### Outstanding TypeScript Errors:
As of the latest typecheck, there are still type errors to fix, particularly in:
- Server-side code
- Component files
- Client-side modules

Run `npm run typecheck` to see the current status of TypeScript errors.