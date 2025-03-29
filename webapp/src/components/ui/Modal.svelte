<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  // Component props with TypeScript types
  export let isOpen: boolean = false;
  // Using const for reference-only exports
  export const fadeEffect: boolean = true;
  export let keyboard: boolean = true;
  export let scrollable: boolean = false;
  export let toggle: (() => void) | undefined = undefined;
  
  // Create typed event dispatcher
  const dispatch = createEventDispatcher<{
    close: void;
  }>();
  
  // Event handlers with proper types
  function handleKeydown(e: KeyboardEvent): void {
    if (keyboard && e.key === 'Escape' && isOpen) {
      if (toggle) toggle();
      dispatch('close');
    }
  }
  
  function handleBackdropClick(): void {
    if (toggle) toggle();
    dispatch('close');
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
  <!-- Use a button for the backdrop to handle both click and keyboard events properly -->
  <div 
    class="modal-backdrop" 
    role="presentation" 
    transition:fade={{ duration: 200 }}
  >
    <!-- Using a button element that visually looks like a div but is semantically interactive -->
    <button 
      type="button" 
      class="backdrop-click-handler" 
      on:click={handleBackdropClick} 
      aria-label="Close modal"
    ></button>
    <div 
      class="modal-dialog {scrollable ? 'modal-dialog-scrollable' : ''}" 
      role="dialog"
      aria-modal="true"
      tabindex="-1"
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
  
  .backdrop-click-handler {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    appearance: none;
    padding: 0;
    margin: 0;
    opacity: 0;
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