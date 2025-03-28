<script>
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let navbar = false;
  export let expand = "";
  
  const dispatch = createEventDispatcher();
  
  $: if (isOpen !== undefined) {
    dispatch('update', { isOpen });
  }
</script>

{#if isOpen}
  <div 
    class="collapse {navbar ? 'navbar-collapse' : ''}"
    transition:slide={{ duration: 300 }}
    {...$$restProps}
  >
    <slot />
  </div>
{/if}

<style>
  .collapse {
    display: block;
  }
  
  .navbar-collapse {
    flex-basis: 100%;
    flex-grow: 1;
    align-items: center;
  }
  
  @media (min-width: 768px) {
    .navbar-collapse {
      display: flex !important;
      flex-basis: auto;
    }
  }
</style>