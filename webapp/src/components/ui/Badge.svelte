<script lang="ts">
  // Badge component with TypeScript and Svelte 5 runes
  
  type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  type BadgeSize = 'sm' | 'md' | 'lg';
  
  const props = $props<{
    variant?: BadgeVariant;
    size?: BadgeSize;
    outline?: boolean;
    pill?: boolean;
    href?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
  }>();
  
  // Default values
  const variant = $derived(props.variant || 'primary');
  const size = $derived(props.size || 'md');
  const outline = $derived(props.outline || false);
  const pill = $derived(props.pill || false);
  const iconPosition = $derived(props.iconPosition || 'left');
  
  // Class construction
  const badgeClass = $derived(() => {
    let classes = ['badge'];
    
    // Variant
    if (outline) {
      classes.push(`badge-outline-${variant}`);
    } else {
      classes.push(`badge-${variant}`);
    }
    
    // Size
    if (size !== 'md') {
      classes.push(`badge-${size}`);
    }
    
    // Pill shape
    if (pill) {
      classes.push('badge-pill');
    }
    
    return classes.join(' ');
  });
</script>

{#if props.href}
  <a href={props.href} class={badgeClass}>
    {#if props.icon && iconPosition === 'left'}
      <i class="{props.icon}"></i>
    {/if}
    
    <slot></slot>
    
    {#if props.icon && iconPosition === 'right'}
      <i class="{props.icon}"></i>
    {/if}
  </a>
{:else}
  <span class={badgeClass}>
    {#if props.icon && iconPosition === 'left'}
      <i class="{props.icon}"></i>
    {/if}
    
    <slot></slot>
    
    {#if props.icon && iconPosition === 'right'}
      <i class="{props.icon}"></i>
    {/if}
  </span>
{/if}

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25em 0.4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
    gap: 0.3em;
  }
  
  .badge-pill {
    padding-right: 0.6em;
    padding-left: 0.6em;
    border-radius: 10rem;
  }
  
  /* Variants */
  .badge-primary {
    color: #fff;
    background-color: #0066cc;
  }
  
  .badge-secondary {
    color: #fff;
    background-color: #6c757d;
  }
  
  .badge-success {
    color: #fff;
    background-color: #28a745;
  }
  
  .badge-danger {
    color: #fff;
    background-color: #dc3545;
  }
  
  .badge-warning {
    color: #212529;
    background-color: #ffc107;
  }
  
  .badge-info {
    color: #fff;
    background-color: #17a2b8;
  }
  
  .badge-light {
    color: #212529;
    background-color: #f8f9fa;
  }
  
  .badge-dark {
    color: #fff;
    background-color: #343a40;
  }
  
  /* Outline variants */
  .badge-outline-primary {
    color: #0066cc;
    background-color: transparent;
    border: 1px solid #0066cc;
  }
  
  .badge-outline-secondary {
    color: #6c757d;
    background-color: transparent;
    border: 1px solid #6c757d;
  }
  
  .badge-outline-success {
    color: #28a745;
    background-color: transparent;
    border: 1px solid #28a745;
  }
  
  .badge-outline-danger {
    color: #dc3545;
    background-color: transparent;
    border: 1px solid #dc3545;
  }
  
  .badge-outline-warning {
    color: #ffc107;
    background-color: transparent;
    border: 1px solid #ffc107;
  }
  
  .badge-outline-info {
    color: #17a2b8;
    background-color: transparent;
    border: 1px solid #17a2b8;
  }
  
  .badge-outline-light {
    color: #f8f9fa;
    background-color: transparent;
    border: 1px solid #f8f9fa;
  }
  
  .badge-outline-dark {
    color: #343a40;
    background-color: transparent;
    border: 1px solid #343a40;
  }
  
  /* Sizes */
  .badge-sm {
    font-size: 65%;
    padding: 0.2em 0.3em;
  }
  
  .badge-lg {
    font-size: 85%;
    padding: 0.3em 0.5em;
  }
  
  a.badge {
    text-decoration: none;
  }
  
  a.badge:hover, a.badge:focus {
    text-decoration: none;
  }
</style>