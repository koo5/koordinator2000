<script lang="ts">
  // Button component with TypeScript and Svelte 5 runes
  
  type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  type ButtonSize = 'sm' | 'md' | 'lg';
  
  const props = $props<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    outline?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    block?: boolean;
    loading?: boolean;
    icon?: string;
    ariaLabel?: string;
  }>();
  
  // Default values
  const variant = $derived(props.variant || 'primary');
  const size = $derived(props.size || 'md');
  const type = $derived(props.type || 'button');
  const disabled = $derived(props.disabled || false);
  const outline = $derived(props.outline || false);
  const block = $derived(props.block || false);
  const loading = $derived(props.loading || false);
  
  // Class construction
  const buttonClass = $derived(() => {
    let classes = ['btn'];
    
    // Variant
    if (outline) {
      classes.push(`btn-outline-${variant}`);
    } else {
      classes.push(`btn-${variant}`);
    }
    
    // Size
    if (size !== 'md') {
      classes.push(`btn-${size}`);
    }
    
    // Block
    if (block) {
      classes.push('btn-block');
    }
    
    // Loading
    if (loading) {
      classes.push('btn-loading');
    }
    
    return classes.join(' ');
  });
</script>

{#if props.href}
  <a 
    href={props.href} 
    class={buttonClass}
    role="button"
    aria-disabled={disabled}
    tabindex={disabled ? '-1' : undefined}
    aria-label={props.ariaLabel}
    on:click
    on:mouseenter
    on:mouseleave
  >
    {#if loading}
      <span class="spinner"></span>
    {/if}
    
    {#if props.icon}
      <i class="{props.icon}"></i>
    {/if}
    
    <slot></slot>
  </a>
{:else}
  <button 
    {type}
    class={buttonClass}
    disabled={disabled || loading}
    aria-label={props.ariaLabel}
    on:click
    on:mouseenter
    on:mouseleave
  >
    {#if loading}
      <span class="spinner"></span>
    {/if}
    
    {#if props.icon}
      <i class="{props.icon}"></i>
    {/if}
    
    <slot></slot>
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    cursor: pointer;
    gap: 0.5rem;
  }
  
  .btn:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  
  /* Variants */
  .btn-primary {
    color: #fff;
    background-color: #0066cc;
    border-color: #0066cc;
  }
  
  .btn-secondary {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
  }
  
  .btn-success {
    color: #fff;
    background-color: #28a745;
    border-color: #28a745;
  }
  
  .btn-danger {
    color: #fff;
    background-color: #dc3545;
    border-color: #dc3545;
  }
  
  .btn-warning {
    color: #212529;
    background-color: #ffc107;
    border-color: #ffc107;
  }
  
  .btn-info {
    color: #fff;
    background-color: #17a2b8;
    border-color: #17a2b8;
  }
  
  .btn-light {
    color: #212529;
    background-color: #f8f9fa;
    border-color: #f8f9fa;
  }
  
  .btn-dark {
    color: #fff;
    background-color: #343a40;
    border-color: #343a40;
  }
  
  .btn-link {
    color: #0066cc;
    background-color: transparent;
    border-color: transparent;
    text-decoration: none;
  }
  
  /* Outline variants */
  .btn-outline-primary {
    color: #0066cc;
    background-color: transparent;
    border-color: #0066cc;
  }
  
  .btn-outline-secondary {
    color: #6c757d;
    background-color: transparent;
    border-color: #6c757d;
  }
  
  .btn-outline-success {
    color: #28a745;
    background-color: transparent;
    border-color: #28a745;
  }
  
  .btn-outline-danger {
    color: #dc3545;
    background-color: transparent;
    border-color: #dc3545;
  }
  
  .btn-outline-warning {
    color: #ffc107;
    background-color: transparent;
    border-color: #ffc107;
  }
  
  .btn-outline-info {
    color: #17a2b8;
    background-color: transparent;
    border-color: #17a2b8;
  }
  
  .btn-outline-light {
    color: #f8f9fa;
    background-color: transparent;
    border-color: #f8f9fa;
  }
  
  .btn-outline-dark {
    color: #343a40;
    background-color: transparent;
    border-color: #343a40;
  }
  
  /* Sizes */
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
  }
  
  .btn-lg {
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    border-radius: 0.3rem;
  }
  
  .btn-block {
    display: flex;
    width: 100%;
  }
  
  /* Loading state */
  .btn-loading {
    position: relative;
    pointer-events: none;
  }
  
  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 0.2em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>