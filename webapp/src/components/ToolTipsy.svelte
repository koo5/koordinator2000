<script lang="ts">
  import { my_user } from '../my_user';

  // Svelte 5 runes style with TypeScript
  const props = $props<{
    css_ref?: string;
    enabled?: boolean;
    position?: 'top' | 'right' | 'bottom' | 'left';
    width?: string;
    showOnClick?: boolean;
  }>();

  // State - Use let instead of const with $state()
  let isVisible = $state(false);

  // Set default values for optional props
  const css_ref = $derived(props.css_ref || '');
  const enabled = $derived(props.enabled !== false);
  const position = $derived(props.position || 'bottom');
  const width = $derived(props.width || 'auto');

  // Position class based on position prop
  const positionClass = $derived(`tooltip-${position}`);

  // Event handlers
  function handleMouseEnter(): void {
    if (enabled && !props.showOnClick) {
      isVisible = true;
    }
  }

  function handleMouseLeave(): void {
    if (enabled && !props.showOnClick) {
      isVisible = false;
    }
  }

  function handleClick(): void {
    if (enabled && props.showOnClick) {
      isVisible = !isVisible;
    }
  }
</script>

{#if enabled}
  <span
    class="tooltipsy"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={handleClick}
    on:keydown={(e) => e.key === 'Enter' && handleClick()}
    role="button"
    tabindex="0"
  >
    <slot></slot>
    <div
      class="tooltiptext {css_ref} {positionClass}"
      class:visible={isVisible}
      style="width: {width};"
    >
      <slot name="tooltip">tooltip</slot>
    </div>
  </span>
{:else}
  <slot></slot>
{/if}

<!--
todo
  https://dev.to/gokayokyay/how-to-use-popper-with-svelte-in-a-sveltish-way-with-actions-2h02?utm_source=dormosheio&utm_campaign=dormosheio
-->

<style>
  .tooltipsy {
    border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
    position: relative;
    display: inline-block;
    cursor: help;
  }

  .tooltiptext {
    border-style: solid;
    visibility: hidden;
    position: absolute;
    z-index: 100;
    padding: 0.5em 1em;
    border: 1px solid #ddd;
    background-color: white;
    color: #333;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 0.9em;
    opacity: 0;
    transition: opacity 0.2s, visibility 0.2s;
  }

  .tooltiptext.visible {
    visibility: visible;
    opacity: 1;
  }

  /* Position variants */
  .tooltip-top {
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  .tooltip-right {
    top: 50%;
    left: 125%;
    transform: translateY(-50%);
  }

  .tooltip-bottom {
    top: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  .tooltip-left {
    top: 50%;
    right: 125%;
    transform: translateY(-50%);
  }

  /* Default show on hover behavior, unless using click mode */
  .tooltipsy:hover .tooltiptext:not(.visible) {
    visibility: visible;
    opacity: 1;
  }
</style>
