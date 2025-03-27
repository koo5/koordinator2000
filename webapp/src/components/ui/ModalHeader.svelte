<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let className = '';
  export { className as class };
  export let toggle = undefined;
  export let closeAriaLabel = 'Close';
  
  function handleClose() {
    if (toggle) {
      toggle();
    }
    dispatch('close');
  }
</script>

<div class="modal-header {className}" {...$$restProps}>
  <h5 class="modal-title">
    <slot></slot>
  </h5>
  
  {#if toggle}
    <button 
      type="button" 
      class="close" 
      aria-label={closeAriaLabel} 
      on:click={handleClose}
      on:keydown
    >
      <span aria-hidden="true">&times;</span>
    </button>
  {/if}
</div>