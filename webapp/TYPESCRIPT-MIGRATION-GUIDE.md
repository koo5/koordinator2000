# TypeScript Migration Guide

This guide outlines the strategy for gradually migrating the Koordinator2000 project to TypeScript.

## Current Status

We've set up TypeScript in the project and started the migration process. Key accomplishments:

- Added TypeScript support to the build configuration
- Created basic type definitions for essential data structures
- Converted several files from JavaScript to TypeScript
- Updated configuration to enable gradual adoption

## Migration Strategy

### 1. File-by-File Conversion

Start with the simplest files and gradually work towards more complex ones:

1. Convert utility files first (`event_dispatcher.js`, `svelte-shared-store.js`)
2. Convert simple components with minimal dependencies
3. Convert data models and services
4. Convert more complex components and pages

### 2. Converting a JavaScript File to TypeScript

To convert a JavaScript file to TypeScript:

1. Rename the file extension from `.js` to `.ts`
2. Add type annotations to functions, variables, and parameters
3. Import or define interfaces for complex data structures
4. Address TypeScript errors that appear

For Svelte files:
1. Change `<script lang='js'>` to `<script lang='ts'>`
2. Add type annotations to exported props and reactive variables
3. Import required type definitions
4. Fix TypeScript errors and warnings

### 3. Converting Svelte Components

Example:

```svelte
<!-- Before -->
<script lang='js'>
  import { my_user } from '../my_user.js';
  
  export let campaign;
  $: title = campaign.title;
</script>

<!-- After -->
<script lang='ts'>
  import { my_user } from '../my_user';
  import type { Campaign } from '../types';
  
  export let campaign: Campaign;
  $: title = campaign.title;
</script>
```

### 4. Using Type Definitions

We've created type definitions in the `src/types/` directory:

- `campaign.ts`: Defines `Campaign` and `Participation` interfaces
- `user.ts`: Defines the `User` interface
- Additional types will be added as needed

Import these types in your TypeScript files:

```typescript
import type { Campaign, Participation } from '../types';
```

## Best Practices

1. **Start simple**: Begin with smaller, self-contained files
2. **Gradual adoption**: The project supports both JavaScript and TypeScript
3. **Keep `any` to a minimum**: Try to define proper types instead of using `any`
4. **Be pragmatic**: If a complex component is proving difficult to type, you can temporarily use `any` and improve it later
5. **Run type checks**: Use `npm run check` to find TypeScript errors

## Running Type Checks

The following scripts are available:

- `npm run check`: Run Svelte type checking
- `npm run check:watch`: Run Svelte type checking in watch mode
- `npm run typecheck`: Run TypeScript type checking without emitting files

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Svelte TypeScript Documentation](https://svelte.dev/docs/typescript)
- [SvelteKit TypeScript Documentation](https://kit.svelte.dev/docs/typescript)
- [Gradual TypeScript Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)