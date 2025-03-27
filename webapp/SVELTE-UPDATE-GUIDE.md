# Svelte Update Guide (Svelte 3 → Svelte 5 / SvelteKit 1 → SvelteKit 2)

This document outlines the key changes and migration steps for the recent update to Svelte 5 and SvelteKit 2.

## Major Changes

1. **Svelte 5 introduces Runes**
   - New reactivity model with `$state()`, `$derived()`, and `$effect()`
   - Legacy component API still fully supported

2. **SvelteKit 2 API Changes**
   - Updated handling of pages and routing
   - New imports and module paths
   - Enhanced TypeScript support

## Common Migration Issues

### 1. Import Changes

**Old:**
```js
import { stores } from '$app/navigation'
const { page } = stores()
```

**New:**
```js
import { page } from '$app/stores'
```

### 2. URL Parameter Access

**Old:**
```js
$page.query.param
$page.params.slug
```

**New:**
```js
$page.url.searchParams.get('param')
$page.params.slug // This remains the same
```

### 3. Preload/Load Functions

**Old:**
```js
export async function preload(page, session) {
  // ...
}
```

**New:**
```js
export const load = async ({ params, fetch }) => {
  // ...
}
```

### 4. Component Initialization

**Old:**
```svelte
<script>
  export let myProp;
  let count = 0;
</script>
```

**New (option 1 - legacy style, still works):**
```svelte
<script>
  export let myProp;
  let count = 0;
</script>
```

**New (option 2 - runes style):**
```svelte
<script>
  const props = $props<{ myProp: string }>();
  const count = $state(0);
</script>
```

## Migration Strategy

1. **Start with API compatibility fixes**
   - Update imports first
   - Fix routing and parameter access
   - Update load functions

2. **Test thoroughly after each change**
   - The application should continue to work with a mix of old and new styles

3. **Gradual component updates**
   - Start with TypeScript type definitions
   - Optionally migrate to runes later

4. **Library compatibility**
   - Some libraries may need updates
   - Check for warnings about missing exports

## Tools to Help Migration

1. **Type checking**: `npm run check`
2. **Development server**: `npm run dev`
3. **Build check**: `npm run build`

## Common Errors and Solutions

### 1. "No matching export in ... for import 'stores'"

**Solution**: Replace `import { stores } from '$app/navigation'` with `import { page } from '$app/stores'`

### 2. "Missing exports condition"

**Solution**: These are warnings about some dependencies. They should still work, but might need updates in the future.

### 3. TypeScript errors

**Solution**: Run `npm run check` and address type issues one by one.

## Benefits of the Update

1. **Better TypeScript Support**
   - Improved type inference
   - Better IDE integration

2. **Performance Improvements**
   - Svelte 5 has enhanced rendering performance
   - Better reactivity system

3. **New Features**
   - Runes for more flexible reactivity
   - Improved routing and form handling in SvelteKit 2

## Resources

- [Svelte 5 Documentation](https://svelte-5-preview.vercel.app/docs)
- [SvelteKit 2 Migration Guide](https://kit.svelte.dev/docs/migrating-to-sveltekit-2)
- [TypeScript in Svelte](https://svelte.dev/docs/typescript)