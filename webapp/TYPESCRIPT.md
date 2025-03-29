# TypeScript Conversion Guide for Koordinator

This document outlines the progress and guidelines for converting the Koordinator codebase from JavaScript to TypeScript.

## Progress Status

### Completed Conversions
The following files have been converted to TypeScript:

- ✅ src/my_user.js → src/my_user.ts
- ✅ src/stuff.js → src/stuff.ts
- ✅ src/settings.js → src/settings.ts
- ✅ src/event_dispatcher.js → src/event_dispatcher.ts
- ✅ src/lib/public_env.js → src/lib/public_env.ts
- ✅ src/svelte-shared-store.js → src/svelte-shared-store.ts
- ✅ src/lib/urql.js → src/lib/urql.ts
- ✅ src/server.js → src/server.ts
- ✅ src/hooks.server.js → src/hooks.server.ts
- ✅ src/client.js → src/client.ts
- ✅ src/polyfills.js → src/polyfills.ts
- ✅ src/jsdoc-template.js → src/jsdoc-template.ts
- ✅ src/browser_theme_setting.js → src/browser_theme_setting.ts
- ✅ src/components/ui/index.js → src/components/ui/index.ts
- ✅ src/routes/+layout.js → src/routes/+layout.ts
- ✅ src/routes/+page.js → src/routes/+page.ts
- ✅ src/routes/you/+page.js → src/routes/you/+page.ts
- ✅ src/routes/auth_event/+server.js → src/routes/auth_event/+server.ts

Additionally, significant TypeScript improvements were made to:
- Added proper type declarations for GraphQL and URQL in types.d.ts
- Added missing module declarations for external dependencies
- Improved environment variable handling with SvelteKit standards

### Next Files to Convert
The next target files are:

- [ ] src/routes/**/*.js → src/routes/**/*.ts (remaining route files)

## Conversion Guidelines

### Basic Steps

1. Create a TypeScript version of a JavaScript file
2. Add explicit type annotations for variables, parameters, and return types
3. Create interfaces for data structures
4. Update imports from other files to reference the TypeScript versions
5. Run `npm run check` to ensure your changes compile correctly

### Import Patterns

Always use explicit file extensions in imports:

```typescript
// Correct:
import { my_function } from './my_module.ts';

// Incorrect:
import { my_function } from './my_module';
```

### Type Definitions

Create interfaces for complex data structures:

```typescript
export interface MyUser {
  id: number;
  name?: string;
  email?: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
}
```

### Component Props

For Svelte components, define prop types at the top of the script tag:

```svelte
<script lang="ts">
  export let title: string;
  export let count: number = 0;
  export let items: string[] = [];
</script>
```

### Strict Null Checks

The project uses `strictNullChecks`, so handle potentially null/undefined values:

```typescript
// Using optional chaining
const userName = user?.name || 'Anonymous';

// Using type guards
if (response && 'data' in response) {
  // response.data is now safely typed
}
```

### Store Typing

For Svelte stores, use appropriate generic types:

```typescript
import { writable, type Writable } from 'svelte/store';

// For a basic store
const count: Writable<number> = writable(0);

// For shared/local storage stores
const user: SharedStore<User> = localStorageSharedStore<User>('user', defaultUser);
```

## Build and Check Commands

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run typecheck` - Check TypeScript types
- `npm run check` - Run all checks (includes typecheck)

## Common TypeScript Errors

### Type Definitions

If you encounter "Could not find a declaration file for module X", use one of these approaches:

1. Install type definitions:
   ```
   npm install --save-dev @types/module-name
   ```

2. Create a declaration file:
   ```typescript
   // src/types.d.ts
   declare module 'module-name';
   ```

### Key Remaining Issues

The main remaining TypeScript errors are:

1. **Component Types**: Many Svelte components need type annotations for their props and variables. Components with `<script lang="ts">` need to have proper TypeScript type annotations.

2. **Runtime vs Build Time Artifacts**: Files like `./handler` that are generated at build time need special handling with `@ts-ignore` comments.

3. **Form Handling**: Form-related code in `+page.svelte` files often need proper type annotations for form elements.

4. **Vite Config**: The Vite config file has some TypeScript errors related to ServerOptions.

### Resolved Issues

1. **GraphQL/URQL Types**: Fixed errors in `src/lib/urql.ts` related to GraphQL type definitions with additional type declarations for URQL and GraphQL.

2. **Missing Module Declarations**: Added module declarations for various dependencies like `html-minifier`, `express`, and `sanitize-html`.

3. **Server TypeScript Compatibility**: Fixed server.ts to properly use TypeScript with environment variables, middleware, and type annotations.

### Environment Variables

SvelteKit provides a standard way to handle environment variables:

```typescript
// For public environment variables (client & server)
import { PUBLIC_API_URL } from '$env/static/public';

// For private environment variables (server only)
import { DATABASE_URL } from '$env/static/private';
```

Remember:
- Public variables must be prefixed with `PUBLIC_` (or `VITE_PUBLIC_` in .env files)
- Private variables are only accessible in server-side code
- Never import `$env/static/private` in client-side code

### Browser vs Server Code

For code that needs to run in both environments:

```typescript
import { browser } from '$app/environment';

// Conditional code based on environment
if (browser) {
  // Only runs in browser
} else {
  // Only runs on server
}

// Conditional type
type MyStore = typeof browser extends true ? ClientStore : ServerStore;
```

## Configuration Notes

The tsconfig.json includes:

- `"allowImportingTsExtensions": true` - Allows .ts extensions in imports
- `"strictNullChecks": true` - Requires explicit null checking
- `"noImplicitAny": true` - Requires explicit typing (or any)