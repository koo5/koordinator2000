<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  
  let className = '';
  export { className as class };
  export let isOpen = false;
  export let navbar = false;
  export let expand = false;
  
  const dispatch = createEventDispatcher();
  
  $: if (isOpen !== undefined) {
    dispatch('update', { isOpen });
  }
</script>

{#if isOpen}
  <div 
    class="collapse {className} {isOpen ? 'show' : ''} {navbar ? 'navbar-collapse' : ''} {expand ? `navbar-expand-${expand}` : ''}"
    transition:slide={{ duration: 300 }}
    {...$$restProps}>
    <slot></slot>
  </div>
{/if}