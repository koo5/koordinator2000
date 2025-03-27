# Svelte 5 State Management Guide

## Important Update: Using `$state()` with Svelte 5

When migrating to Svelte 5 Runes, there's an important change to how mutable state works. The `$state()` function creates reactive state, but there's a key difference in how you should declare variables that need to be mutated.

### Problem: Using `const` with `$state()`

In earlier examples, we were using `const` with `$state()` like this:

```svelte
<script lang="ts">
  const count = $state(0);
  
  function increment() {
    count++; // Error: Cannot assign to 'count' because it is a constant
  }
</script>
```

This code will fail because `count` is declared as a constant, but we're trying to mutate it directly.

### Solution: Use `let` with `$state()`

The correct approach is to use `let` for variables that will be mutated:

```svelte
<script lang="ts">
  let count = $state(0);
  
  function increment() {
    count++; // This works correctly
  }
</script>
```

## Updating Components

We've updated our components to follow this pattern:

1. Use `let` for state that will be directly assigned to:
   ```svelte
   let isVisible = $state(false);
   ```

2. Keep using `const` for derived state or props that don't need direct reassignment:
   ```svelte
   const isActiveClass = $derived(isActive ? 'active' : '');
   ```

## Patterns for State Management

### Direct Assignment

For basic state updates, directly assign to the variable:

```svelte
let count = $state(0);

function increment() {
  count++;
}

function reset() {
  count = 0;
}
```

### Objects and Arrays

For objects and arrays, you can either assign a new object/array or modify the existing one:

```svelte
let user = $state({ name: 'John', age: 30 });

// Method 1: Create a new object (cleaner approach)
function updateName(newName) {
  user = { ...user, name: newName };
}

// Method 2: Directly modify property (also works)
function incrementAge() {
  user.age++;
}

// For arrays
let items = $state([1, 2, 3]);

// Method 1: Create a new array
function addItem(item) {
  items = [...items, item];
}

// Method 2: Modify in place
function removeFirst() {
  items.shift();
}
```

### Complex State Logic

For complex state updates, consider using functions that encapsulate the logic:

```svelte
let formState = $state({
  values: { username: '', email: '' },
  errors: {},
  isSubmitting: false,
  isValid: true
});

function updateField(name, value) {
  formState = {
    ...formState,
    values: {
      ...formState.values,
      [name]: value
    }
  };
}

function setSubmitting(isSubmitting) {
  formState = {
    ...formState,
    isSubmitting
  };
}
```

## Best Practices

1. **Use `let` for mutable state**: Always use `let` when declaring state that will be reassigned.

2. **Use `const` for derived values**: Use `const` with `$derived()` for computed values.

3. **Immutability when possible**: Prefer creating new objects/arrays rather than mutating them in place.

4. **Explicit updates**: Make state changes explicit and avoid deep mutations when possible.

5. **Extract complex logic**: For complex state transitions, extract the logic into functions.

## Type Safety

TypeScript works well with Svelte 5 Runes state:

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  // Specify the type for better IDE support
  let user = $state<User | null>(null);
  
  function setUser(newUser: User) {
    user = newUser;
  }
  
  function resetUser() {
    user = null;
  }
</script>
```

By following these patterns, your components will have clean, predictable state management that works well with Svelte 5's reactivity system.
