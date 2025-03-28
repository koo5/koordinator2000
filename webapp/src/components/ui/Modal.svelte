<script>
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let fadeEffect = true;
  export let keyboard = true;
  export let scrollable = false;
  export let toggle = undefined;
  
  const dispatch = createEventDispatcher();
  
  function handleKeydown(e) {
    if (keyboard && e.key === 'Escape' && isOpen) {
      if (toggle) toggle();
      dispatch('close');
    }
  }
  
  function handleBackdropClick() {
    if (toggle) toggle();
    dispatch('close');
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick} transition:fade={{ duration: 200 }}>
    <div 
      class="modal-dialog {scrollable ? 'modal-dialog-scrollable' : ''}" 
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    overflow-x: hidden;
    overflow-y: auto;
  }
  
  .modal-dialog {
    position: relative;
    width: auto;
    margin: 0.5rem;
    max-width: 500px;
    pointer-events: none;
  }
  
  .modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.3rem;
    outline: 0;
  }
  
  .modal-dialog-scrollable {
    max-height: calc(100% - 1rem);
  }
  
  .modal-dialog-scrollable .modal-content {
    max-height: calc(100vh - 1rem);
    overflow: hidden;
  }
  
  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 500px;
      margin: 1.75rem auto;
    }
  }
</style>