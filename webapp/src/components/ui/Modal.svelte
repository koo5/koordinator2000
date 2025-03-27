<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  // Modal properties
  export let isOpen = false;
  export let title = '';
  export let size = 'md'; // sm, md, lg, xl
  export let centered = false;
  export let scrollable = false;
  export let fade = true;
  export let backdrop = true;
  export let keyboard = true; // Close on Esc key

  // Internal state
  let modal: HTMLDivElement;
  let dialog: HTMLDivElement;
  let body: HTMLBodyElement;
  let originalBodyPadding = '';
  let scrollbarWidth = 0;

  const dispatch = createEventDispatcher();

  function close() {
    if (!isOpen) return;
    dispatch('close');
    isOpen = false;
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      isOpen = true;
      dispatch('open');
    }
  }

  // Handle clicks on backdrop
  function handleBackdropClick(e: MouseEvent) {
    if (backdrop && e.target === modal) {
      close();
    }
  }

  // Handle keyboard events
  function handleKeydown(e: KeyboardEvent) {
    if (keyboard && e.key === 'Escape' && isOpen) {
      close();
    }
  }

  // ARIA roles and attributes
  $: modalAttributes = {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': title ? 'modal-title' : undefined,
    tabindex: '-1'
  };

  // Class handling
  $: dialogClasses = [
    'modal-dialog',
    size && size !== 'md' && `modal-${size}`,
    centered && 'modal-dialog-centered',
    scrollable && 'modal-dialog-scrollable'
  ].filter(Boolean).join(' ');

  // Body scroll management
  onMount(() => {
    body = document.body;
    scrollbarWidth = getScrollbarWidth();
    
    return () => {
      // Clean up when component is destroyed
      if (isOpen) {
        restoreBodyStyles();
      }
    };
  });

  // When the modal opens/closes
  $: if (isOpen) {
    if (body) {
      setBodyStyles();
    }
  } else {
    if (body) {
      restoreBodyStyles();
    }
  }

  function setBodyStyles() {
    originalBodyPadding = body.style.paddingRight || '';
    const bodyHasScrollbar = body.clientWidth < window.innerWidth;
    
    if (bodyHasScrollbar) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    body.style.overflow = 'hidden';
  }

  function restoreBodyStyles() {
    body.style.paddingRight = originalBodyPadding;
    body.style.overflow = '';
  }

  function getScrollbarWidth() {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    scrollDiv.style.width = '50px';
    scrollDiv.style.height = '50px';
    scrollDiv.style.overflow = 'scroll';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div 
    bind:this={modal}
    class="modal"
    class:show={isOpen}
    class:fade
    on:click={handleBackdropClick}
    transition:fade={{ duration: 150 }}
    {...modalAttributes}
    {...$$restProps}
  >
    <div bind:this={dialog} class={dialogClasses}>
      <div class="modal-content">
        <!-- Modal header with close button -->
        {#if $$slots.header || title}
          <div class="modal-header">
            <slot name="header">
              {#if title}
                <h5 class="modal-title" id="modal-title">{title}</h5>
              {/if}
            </slot>
            <button 
              type="button" 
              class="close" 
              aria-label="Close" 
              on:click={close}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        {/if}
        
        <!-- Modal body -->
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <!-- Modal footer -->
        {#if $$slots.footer}
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Backdrop -->
  {#if backdrop}
    <div 
      class="modal-backdrop"
      class:fade
      class:show={isOpen}
      transition:fade={{ duration: 150 }}
    ></div>
  {/if}
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    display: block;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
  }

  .modal.fade {
    transition: opacity 0.15s linear;
  }

  .modal.show {
    opacity: 1;
  }

  .modal-dialog {
    position: relative;
    width: auto;
    margin: 0.5rem;
    pointer-events: none;
  }

  .modal.fade .modal-dialog {
    transition: transform 0.3s ease-out;
    transform: translate(0, -50px);
  }

  .modal.show .modal-dialog {
    transform: none;
  }

  .modal-dialog-scrollable {
    display: flex;
    max-height: calc(100% - 1rem);
  }

  .modal-dialog-scrollable .modal-content {
    max-height: calc(100vh - 1rem);
    overflow: hidden;
  }

  .modal-dialog-scrollable .modal-body {
    overflow-y: auto;
  }

  .modal-dialog-centered {
    display: flex;
    align-items: center;
    min-height: calc(100% - 1rem);
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

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: #000;
  }

  .modal-backdrop.fade {
    opacity: 0;
  }

  .modal-backdrop.show {
    opacity: 0.5;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    border-top-left-radius: 0.3rem;
    border-top-right-radius: 0.3rem;
  }

  .modal-header .close {
    padding: 1rem;
    margin: -1rem -1rem -1rem auto;
    background-color: transparent;
    border: 0;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .modal-title {
    margin-bottom: 0;
    line-height: 1.5;
  }

  .modal-body {
    position: relative;
    flex: 1 1 auto;
    padding: 1rem;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid #e9ecef;
    border-bottom-right-radius: 0.3rem;
    border-bottom-left-radius: 0.3rem;
  }

  .modal-footer > :not(:first-child) {
    margin-left: 0.25rem;
  }

  .modal-footer > :not(:last-child) {
    margin-right: 0.25rem;
  }

  /* Responsive styling */
  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 500px;
      margin: 1.75rem auto;
    }

    .modal-dialog-scrollable {
      max-height: calc(100% - 3.5rem);
    }

    .modal-dialog-scrollable .modal-content {
      max-height: calc(100vh - 3.5rem);
    }

    .modal-dialog-centered {
      min-height: calc(100% - 3.5rem);
    }

    .modal-sm {
      max-width: 300px;
    }
  }

  @media (min-width: 992px) {
    .modal-lg,
    .modal-xl {
      max-width: 800px;
    }
  }

  @media (min-width: 1200px) {
    .modal-xl {
      max-width: 1140px;
    }
  }
</style>
