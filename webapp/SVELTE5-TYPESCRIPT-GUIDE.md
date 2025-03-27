# Svelte 5 with TypeScript Guide

This guide explains how to use Svelte 5 runes with TypeScript in this project while maintaining compatibility with external libraries.

## Configuration

The project is configured to support both Svelte 5 runes and legacy Svelte components simultaneously. This allows us to:

1. Use Svelte 5 runes in new components
2. Keep compatibility with legacy Svelte components
3. Use external libraries written for Svelte 3/4

### Svelte Configuration

In `svelte.config.js`, we've set up the following configuration:

```js
compilerOptions: {
  // Don't globally enable runes mode to allow external libraries to work
  // Instead we'll opt-in per file with <script lang="ts">
  runes: false,
  
  // For backwards compatibility with legacy components
  compatibility: {
    // Keep the legacy reactivity for backwards compatibility
    componentApi: true,
    
    // Allow for easier interoperability between runes and non-runes components
    events: true,
    
    // Better compatibility with older patterns
    css: true
  }
}
```

This setup:
- Keeps runes disabled globally (to avoid breaking external libraries)
- Enables compatibility mode for the legacy component API
- Makes events and CSS handle better for cross-compatibility

## Using Runes in Components

To use runes in a component, explicitly opt-in by adding the `runes` attribute to your script tag:

```svelte
<script lang="ts">
  // Now you can use runes in this component
  const count = $state(0);
  const doubled = $derived(count * 2);
</script>
```

If you don't add the `runes` attribute, the component will use the legacy Svelte reactivity system:

```svelte
<script lang="ts">
  // Legacy reactivity
  let count = 0;
  $: doubled = count * 2;
</script>
```

## TypeScript Integration

All runes components should use TypeScript for better type safety. Here's how to define props and state:

### Props

Use the `$props<T>()` rune to define typed props:

```svelte
<script lang="ts">
  // Define props interface with optional properties
  const props = $props<{
    title: string;
    count?: number;
    items?: string[];
  }>();
  
  // Access props with proper types
  const title = $derived(props.title);
  const count = $derived(props.count || 0);
</script>
```

### State

Use the `$state<T>()` rune to define typed state with `let` (not `const`) for mutable state:

```svelte
<script lang="ts">
  // Define typed state with let for variables that will be mutated
  let count = $state<number>(0);
  let items = $state<string[]>([]);
  
  // For complex objects, define an interface
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  // Then use it with $state
  let user = $state<User | null>(null);
  
  // Now you can assign to these variables directly
  function increment() {
    count++; // Works because count was declared with let
  }
  
  function addItem(item: string) {
    items = [...items, item]; // Works because items was declared with let
  }
</script>
```

**Important**: Always use `let` (not `const`) for state variables that will be directly assigned to. Using `const` with `$state()` will cause an error when you try to reassign the value.

See `SVELTE5-RUNES-STATE.md` for more details about state handling.

### Derived Values

Use `$derived()` for computed values:

```svelte
<script lang="ts">
  const count = $state(0);
  
  // TypeScript infers the type (number in this case)
  const doubled = $derived(count * 2);
  
  // For complex logic, you can use a function expression
  const displayText = $derived(() => {
    if (count < 0) return "Negative";
    if (count > 0) return "Positive";
    return "Zero";
  });
</script>
```

### Effects

Use `$effect()` for side effects:

```svelte
<script lang="ts">
  const count = $state(0);
  
  // Run side effects when dependencies change
  $effect(() => {
    console.log(`Count changed to ${count}`);
    
    // Return a cleanup function if needed
    return () => {
      console.log(`Cleaning up at count ${count}`);
    };
  });
</script>
```

## Component Examples

### UI Component (Input)

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define types
  type InputType = 'text' | 'email' | 'password';
  
  // Define props
  const props = $props<{
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    type?: InputType;
    required?: boolean;
  }>();
  
  // State with defaults
  const inputValue = $state(props.value || '');
  const type = $derived(props.type || 'text');
  const id = $state(props.id || `input-${Math.random().toString(36).slice(2)}`);
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    change: string;
    input: string;
  }>();
  
  // Event handlers
  function handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    dispatch('input', inputValue);
  }
  
  function handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    dispatch('change', inputValue);
  }
  
  // Update internal value when prop changes
  $effect(() => {
    if (props.value !== undefined && props.value !== inputValue) {
      inputValue = props.value;
    }
  });
</script>

<div class="form-group">
  {#if props.label}
    <label for={id}>{props.label}</label>
  {/if}
  
  <input
    {id}
    name={props.name}
    type={type}
    value={inputValue}
    required={props.required}
    on:input={handleInput}
    on:change={handleChange}
  />
</div>
```

### Data Component with API Integration

```svelte
<script lang="ts">
  // Define interfaces
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  // Props
  const props = $props<{
    userId?: number;
  }>();
  
  // State
  const user = $state<User | null>(null);
  const loading = $state(false);
  const error = $state<string | null>(null);
  
  // Load user data when userId changes
  $effect(() => {
    if (!props.userId) return;
    
    async function loadUser() {
      loading = true;
      error = null;
      
      try {
        const response = await fetch(`/api/users/${props.userId}`);
        if (!response.ok) throw new Error('Failed to load user');
        user = await response.json();
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
        user = null;
      } finally {
        loading = false;
      }
    }
    
    loadUser();
  });
</script>

<div class="user-profile">
  {#if loading}
    <div class="loading">Loading user data...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if user}
    <h2>{user.name}</h2>
    <p>Email: {user.email}</p>
  {:else}
    <div class="no-data">No user selected</div>
  {/if}
</div>
```

## Interoperability with Legacy Components

When importing legacy components into runes components (or vice versa), the main difference is in how props and events are handled:

### Importing Legacy Components into Runes Components

```svelte
<script lang="ts">
  import LegacyComponent from './LegacyComponent.svelte';
  
  const value = $state('hello');
  
  function handleChange(event) {
    // Event has detail property (which is standard Svelte event handling)
    value = event.detail;
  }
</script>

<!-- Legacy components work as expected -->
<LegacyComponent 
  value={value} 
  on:change={handleChange} 
/>
```

### Importing Runes Components into Legacy Components

```svelte
<script lang="ts">
  import RunesComponent from './RunesComponent.svelte';
  
  // Legacy Svelte reactivity
  let value = 'hello';
  
  function handleChange(event) {
    // Event handling is standardized, so this just works
    value = event.detail;
  }
</script>

<!-- Runes components work as expected -->
<RunesComponent 
  value={value} 
  on:change={handleChange} 
/>
```

## Best Practices

1. **Explicitly opt-in to runes** - Use `<script lang="ts">` to make it clear which components use runes.

2. **Use TypeScript with all runes components** - The combination provides the best developer experience.

3. **Gradually migrate components** - Start with new components and independent components rather than trying to convert everything at once.

4. **Be careful with external libraries** - If a library doesn't work, it may be due to runes compatibility issues.

5. **Consistent event handling** - Use `createEventDispatcher` with TypeScript generics for type-safe event handling.

6. **Document components well** - Add comments about expected props, events, and behaviors.

## Troubleshooting

### "Cannot read property '$' of undefined"

This often means you're trying to use a runes feature in a non-runes component. Make sure your component has `runes` attribute: `<script lang="ts">`.

### "Property does not exist on type"

Ensure you've properly defined your prop types with `$props<T>()`.

### Issues with External Libraries

If an external library doesn't work:

1. Check if it's compatible with Svelte 5
2. Create a wrapper component that bridges between runes and the library
3. Consider finding an alternative library or building your own component

### TypeScript Errors with Runes

Make sure your TypeScript config is set up correctly to work with Svelte 5 runes. If you're getting errors about runes syntax, you may need to update your TypeScript configuration or IDE settings.
