<script>
  import { createEventDispatcher } from 'svelte';
  import Settings from './Settings.svelte';
  
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  
  function closeModal() {
    dispatch('close');
  }
  
  // Close modal when Escape key is pressed
  function handleKeydown(event) {
    if (event.key === 'Escape' && isOpen) {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-backdrop" on:click={closeModal} on:keydown={() => {}}>
    <div class="modal-content" on:click|stopPropagation on:keydown={() => {}}>
      <div class="modal-header">
        <h2>Settings</h2>
        <button class="close-button" on:click={closeModal}>×</button>
      </div>
      
      <div class="modal-body">
        <Settings />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fade-in 0.2s ease-out;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    animation: slide-up 0.3s ease-out;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .close-button:hover {
    color: #333;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slide-up {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
