<script>
  import { createEventDispatcher } from 'svelte';
  import Settings from './Settings.svelte';
  import { my_user } from '../my_user.js';
  
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

  // Handle click on backdrop (outside content)
  function handleBackdropClick() {
    closeModal();
  }

  // Stop propagation on content click
  function handleContentClick(event) {
    event.stopPropagation();
  }
  
  // Export toggle function to be bound externally
  export function toggle_settings() {
    isOpen = !isOpen;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Use a more semantic structure with proper keyboard handling -->
  <div 
    class="modal-backdrop" 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Enter' && handleBackdropClick()}>
    
    <!-- The content container -->
    <div 
      class="modal-content" 
      role="document"
      on:click={handleContentClick}>
      <div class="modal-header">
        <h2>Settings</h2>
        <button 
          class="close-button" 
          aria-label="Close settings" 
          on:click={closeModal}>×</button>
      </div>
      
      <div class="modal-body">
        <Settings />
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={closeModal}>Close</button>
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
    max-width: 600px;
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
    background: transparent;
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
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid #eee;
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