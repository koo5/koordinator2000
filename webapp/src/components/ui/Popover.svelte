<script>
  import { onMount } from 'svelte';
  import { classnames } from '../../lib/utils';
  
  let className = '';
  export { className as class };
  export let animation = true;
  export let children = undefined;
  export let container = undefined;
  export let dismissible = false;
  export let isOpen = false;
  export let placement = 'top';
  export let target = '';
  export let title = '';
  export let trigger = 'click';
  let targetEl;
  let popoverEl;
  let popperPlacement = placement;

  const open = () => isOpen = true;
  const close = () => isOpen = false;
  const toggle = () => isOpen = !isOpen;

  onMount(() => {
    targetEl = document.querySelector(`#${target}`);
    if (!targetEl) {
      console.error(`Target element with id '${target}' not found`);
      return;
    }
    
    switch (trigger) {
      case 'hover':
        targetEl.addEventListener('mouseover', open);
        targetEl.addEventListener('mouseleave', close);
        break;
      case 'focus':
        targetEl.addEventListener('focus', open);
        targetEl.addEventListener('blur', close);
        break;
      default:
        targetEl.addEventListener('click', toggle);
        if (dismissible) targetEl.addEventListener('blur', close);
        break;
    }
    
    return () => {
      if (!targetEl) return;
      
      switch (trigger) {
        case 'hover':
          targetEl.removeEventListener('mouseover', open);
          targetEl.removeEventListener('mouseleave', close);
          break;
        case 'focus':
          targetEl.removeEventListener('focus', open);
          targetEl.removeEventListener('blur', close);
          break;
        default:
          targetEl.removeEventListener('click', toggle);
          if (dismissible) targetEl.removeEventListener('blur', close);
          break;
      }
    };
  });

  $: if (!target) {
    throw new Error('Need target!');
  }

  $: classes = classnames(
    className,
    'popover',
    animation ? 'fade' : false,
    `bs-popover-${popperPlacement}`,
    isOpen ? 'show' : false
  );
</script>

{#if isOpen}
  <div 
    bind:this={popoverEl}
    {...$$restProps}
    class={classes}
    role="tooltip"
    x-placement={popperPlacement}
    style={`position: absolute; ${getPopoverPosition(placement, targetEl)}`}>
    <div class="arrow" />
    <h3 class="popover-header">
      <slot name="title">{title}</slot>
    </h3>
    <div class="popover-body">
      {#if children}
        {children}
      {:else}
        <slot />
      {/if}
    </div>
  </div>
{/if}

<script context="module">
  // Simple positioning function to replace popper.js
  function getPopoverPosition(placement, targetElement) {
    if (!targetElement) return '';
    
    const rect = targetElement.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    let top, left;
    
    switch (placement) {
      case 'top':
        top = rect.top + scrollTop - 10;
        left = rect.left + scrollLeft + (rect.width / 2);
        return `top: ${top}px; left: ${left}px; transform: translate(-50%, -100%);`;
      
      case 'bottom':
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + (rect.width / 2);
        return `top: ${top}px; left: ${left}px; transform: translateX(-50%);`;
      
      case 'left':
        top = rect.top + scrollTop + (rect.height / 2);
        left = rect.left + scrollLeft - 10;
        return `top: ${top}px; left: ${left}px; transform: translate(-100%, -50%);`;
      
      case 'right':
        top = rect.top + scrollTop + (rect.height / 2);
        left = rect.right + scrollLeft + 10;
        return `top: ${top}px; left: ${left}px; transform: translateY(-50%);`;
      
      default:
        top = rect.top + scrollTop - 10;
        left = rect.left + scrollLeft + (rect.width / 2);
        return `top: ${top}px; left: ${left}px; transform: translate(-50%, -100%);`;
    }
  }
</script>

<style>
  .popover {
    max-width: 276px;
    font-size: 0.875rem;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.3rem;
    z-index: 1060;
  }
  
  .arrow {
    position: absolute;
    display: block;
    width: 1rem;
    height: 0.5rem;
  }
  
  .bs-popover-top .arrow {
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .bs-popover-bottom .arrow {
    top: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .bs-popover-left .arrow {
    right: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .bs-popover-right .arrow {
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .popover-header {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0;
    font-size: 1rem;
    background-color: #f7f7f7;
    border-bottom: 1px solid #ebebeb;
    border-top-left-radius: calc(0.3rem - 1px);
    border-top-right-radius: calc(0.3rem - 1px);
  }
  
  .popover-body {
    padding: 0.5rem 0.75rem;
    color: #212529;
  }
  
  .fade {
    transition: opacity 0.15s linear;
  }
  
  .show {
    opacity: 1;
  }
</style>