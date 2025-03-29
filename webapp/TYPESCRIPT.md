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

### Next Files to Convert
The next target files are:

- [ ] src/server.js → src/server.ts
- [ ] src/hooks.server.js → src/hooks.server.ts
- [ ] src/client.js → src/client.ts
- [ ] src/polyfills.js → src/polyfills.ts
- [ ] src/routes/**/*.js → src/routes/**/*.ts

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