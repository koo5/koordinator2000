# Svelte 5 State Management vs. Other Frameworks

This document explains how Svelte 5's approach to state management differs from other popular frameworks like React, Vue, and Angular. Understanding these differences is important when migrating code or working with multiple frameworks.

## Svelte 5 State Management

### The `$state()` Rune

Svelte 5 introduces the `$state()` rune for creating reactive state:

```svelte
<script lang="ts">
  let count = $state(0);
  
  function increment() {
    count++; // Direct mutation!
  }
</script>
```

### Key Characteristics

1. **Direct Mutation**: You modify state directly by assigning to variables
2. **Mutable State Paradigm**: Uses a mutable programming model
3. **Variable Declarations**: Must use `let` (not `const`) for mutable state
4. **Fine-grained Updates**: Only affected components re-render
5. **No Special Update Functions**: No need for `setState` or similar

## Comparison with React

React uses an immutable state model with hooks like `useState`:

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  function increment() {
    setCount(count + 1); // Call a setter function
  }
  
  return <button onClick={increment}>{count}</button>;
}
```

### Key Differences

1. React requires a setter function (`setCount`)
2. React discourages direct state mutation
3. React uses `const` for state variables as they're not directly reassigned
4. React updates are batched and can trigger more re-renders

## Comparison with Vue

Vue 3's Composition API uses reactive references:

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++ // Mutate the .value property
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### Key Differences

1. Vue wraps primitives in refs with a `.value` property
2. Vue allows direct mutation of the `.value` property
3. Vue encourages `const` since you're mutating a property, not reassigning the variable
4. Vue uses a proxy-based reactivity system

## Comparison with Angular

Angular uses two-way binding with component properties:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: '<button (click)="increment()">{{ count }}</button>'
})
export class CounterComponent {
  count = 0;
  
  increment() {
    this.count++; // Direct mutation, similar to Svelte!
  }
}
```

### Key Differences

1. Angular also uses direct mutation like Svelte
2. Angular uses class properties rather than local variables
3. Angular uses change detection cycles instead of fine-grained updates
4. Angular can have zone.js overhead for tracking changes

## Migration Tips

When migrating between frameworks:

### From React to Svelte 5

- Replace `const [x, setX] = useState(initialValue)` with `let x = $state(initialValue)`
- Replace `setX(newValue)` with `x = newValue`
- Replace `setX(prev => prev + 1)` with `x++`
- For object updates, you can either create a new object (`x = {...x, prop: value}`) or mutate directly (`x.prop = value`)

### From Vue to Svelte 5

- Replace `const x = ref(initialValue)` with `let x = $state(initialValue)`
- Replace `x.value = newValue` with `x = newValue`
- Remove need to access `.value` in template references

### From Angular to Svelte 5

- Replace class properties with local variables using `$state()`
- Angular and Svelte have the most similar mental models for state updates

## Best Practices in Svelte 5

1. **Use `let` for Mutable State**: Always use `let` for variables created with `$state()`

2. **Prefer Immutability for Complex Updates**: For complex objects/arrays, creating new ones can be clearer:
   ```js
   // Instead of multiple individual mutations:
   user.name = 'Alice';
   user.age = 25;
   user.email = 'alice@example.com';
   
   // Consider a single immutable update:
   user = {
     ...user,
     name: 'Alice',
     age: 25,
     email: 'alice@example.com'
   };
   ```

3. **Leverage TypeScript**: Add type annotations to ensure type safety:
   ```ts
   interface User {
     id: number;
     name: string;
     email: string;
   }
   
   let user = $state<User>({ id: 1, name: 'John', email: 'john@example.com' });
   ```

4. **Use `$derived` for Computed Values**: Instead of computed properties, use `$derived`:
   ```js
   let count = $state(0);
   const doubled = $derived(count * 2);
   ```

5. **Use `$effect` for Side Effects**: Similar to React's useEffect, but more fine-grained:
   ```js
   $effect(() => {
     console.log(`The count is now ${count}`);
     
     // Optional cleanup function
     return () => {
       console.log('Cleaning up');
     };
   });
   ```

## Conclusion

Svelte 5's approach to state management is different from other frameworks, particularly its use of direct mutation with `let` variables. By understanding these differences, you can write more idiomatic code in Svelte 5 and avoid common pitfalls when migrating from other frameworks.
