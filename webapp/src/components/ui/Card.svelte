<script lang="ts">
  // Card component with TypeScript
  
  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
  export let image: string | undefined = undefined;
  export let imageAlt: string | undefined = undefined;
  export let imagePosition: 'top' | 'bottom' = 'top';
  export let elevation: 0 | 1 | 2 | 3 | 4 | 5 = 1;
  export let border = true;
  export let rounded = true;
  export let clickable = false;
  export let href: string | undefined = undefined;
  
  // Derived values
  $: clickableState = clickable || !!href;
  
  // Computed classes
  $: cardClass = (() => {
    const classes = ['card'];
    
    // Elevation
    if (elevation > 0) {
      classes.push(`elevation-${elevation}`);
    }
    
    // Border
    if (!border) {
      classes.push('no-border');
    }
    
    // Rounded corners
    if (rounded) {
      classes.push('rounded');
    }
    
    // Clickable card
    if (clickableState) {
      classes.push('clickable');
    }
    
    return classes.join(' ');
  })();
  
  // Check if we have slots
  let hasHeaderSlot = false;
  let hasFooterSlot = false;
  let hasDefaultSlot = false;
  
  // Event handlers
  function handleClick() {
    if (href) {
      window.location.href = href;
    }
  }
  
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Check for slots
    hasHeaderSlot = !!document.querySelector('[slot="header"]');
    hasFooterSlot = !!document.querySelector('[slot="footer"]');
    hasDefaultSlot = !!document.querySelector('[slot="default"]');
  });
</script>

<div 
  class={cardClass}
  on:click={clickableState ? handleClick : undefined}
  role={clickableState ? 'button' : undefined}
  tabindex={clickableState ? 0 : undefined}
>
  {#if image && imagePosition === 'top'}
    <div class="card-image">
      <img src={image} alt={imageAlt || ''} />
    </div>
  {/if}
  
  {#if title || subtitle || hasHeaderSlot}
    <div class="card-header">
      {#if hasHeaderSlot}
        <slot name="header"></slot>
      {:else}
        {#if title}
          <h3 class="card-title">{title}</h3>
        {/if}
        {#if subtitle}
          <p class="card-subtitle">{subtitle}</p>
        {/if}
      {/if}
    </div>
  {/if}
  
  <div class="card-body">
    <slot></slot>
  </div>
  
  {#if hasFooterSlot}
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  {/if}
  
  {#if image && imagePosition === 'bottom'}
    <div class="card-image">
      <img src={image} alt={imageAlt || ''} />
    </div>
  {/if}
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .card.rounded {
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .card:not(.no-border) {
    border: 1px solid rgba(0, 0, 0, 0.125);
  }
  
  /* Elevations */
  .card.elevation-1 {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  }
  
  .card.elevation-2 {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
  }
  
  .card.elevation-3 {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.1);
  }
  
  .card.elevation-4 {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.12);
  }
  
  .card.elevation-5 {
    box-shadow: 0 19px 38px rgba(0, 0, 0, 0.2), 0 15px 12px rgba(0, 0, 0, 0.15);
  }
  
  .card.clickable {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .card.clickable:hover {
    transform: translateY(-3px);
  }
  
  .card.clickable:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
  
  .card-image {
    width: 100%;
  }
  
  .card-image img {
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
  }
  
  .card-header {
    padding: 1rem 1rem 0.5rem;
  }
  
  .card-title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 500;
  }
  
  .card-subtitle {
    margin: -0.5rem 0 0.5rem;
    color: #6c757d;
    font-size: 0.875rem;
  }
  
  .card-body {
    padding: 1rem;
    flex: 1 1 auto;
  }
  
  .card-footer {
    padding: 0.5rem 1rem 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.125);
  }
</style>