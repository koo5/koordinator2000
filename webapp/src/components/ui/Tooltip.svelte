<script>
  import { onMount } from 'svelte';
  import { classnames } from '../../lib/utils';
  
  let className = '';
  export { className as class };
  export let animation = true;
  export let children = undefined;
  export let isOpen = false;
  export let placement = 'top';
  export let target = '';
  export let trigger = 'hover';
  let targetEl;
  let tooltipEl;

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
        targetEl.addEventListener('mouseenter', open);
        targetEl.addEventListener('mouseleave', close);
        break;
      case 'focus':
        targetEl.addEventListener('focus', open);
        targetEl.addEventListener('blur', close);
        break;
      case 'click':
        targetEl.addEventListener('click', toggle);
        break;
      default:
        targetEl.addEventListener('mouseenter', open);
        targetEl.addEventListener('mouseleave', close);
        break;
    }
    
    return () => {
      if (!targetEl) return;
      
      switch (trigger) {
        case 'hover':
          targetEl.removeEventListener('mouseenter', open);
          targetEl.removeEventListener('mouseleave', close);
          break;
        case 'focus':
          targetEl.removeEventListener('focus', open);
          targetEl.removeEventListener('blur', close);
          break;
        case 'click':
          targetEl.removeEventListener('click', toggle);
          break;
        default:
          targetEl.removeEventListener('mouseenter', open);
          targetEl.removeEventListener('mouseleave', close);
          break;
      }
    };
  });

  $: if (!target) {
    throw new Error('Need target!');
  }

  $: classes = classnames(
    className,
    'tooltip',
    animation ? 'fade' : false,
    `bs-tooltip-${placement}`,
    isOpen ? 'show' : false
  );
</script>

{#if isOpen}
  <div 
    bind:this={tooltipEl}
    {...$$restProps}
    class={classes}
    role="tooltip"
    style={`position: absolute; ${getTooltipPosition(placement, targetEl)}`}>
    <div class="arrow" />
    <div class="tooltip-inner">
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
  function getTooltipPosition(placement, targetElement) {
    if (!targetElement) return '';
    
    const rect = targetElement.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    let top, left;
    
    switch (placement) {
      case 'top':
        top = rect.top + scrollTop - 8;
        left = rect.left + scrollLeft + (rect.width / 2);
        return `top: ${top}px; left: ${left}px; transform: translate(-50%, -100%);`;
      
      case 'bottom':
        top = rect.bottom + scrollTop + 8;
        left = rect.left + scrollLeft + (rect.width / 2);
        return `top: ${top}px; left: ${left}px; transform: translateX(-50%);`;
      
      case 'left':
        top = rect.top + scrollTop + (rect.height / 2);
        left = rect.left + scrollLeft - 8;
        return `top: ${top}px; left: ${left}px; transform: translate(-100%, -50%);`;
      
      case 'right':
        top = rect.top + scrollTop + (rect.height / 2);
        left = rect.right + scrollLeft + 8;
        return `top: ${top}px; left: ${left}px; transform: translateY(-50%);`;
      
      default:
        top = rect.top + scrollTop - 8;
        left = rect.left + scrollLeft + (rect.width / 2);
        return `top: ${top}px; left: ${left}px; transform: translate(-50%, -100%);`;
    }
  }
</script>

<style>
  .tooltip {
    max-width: 200px;
    z-index: 1070;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  
  .tooltip-inner {
    padding: 0.25rem 0.5rem;
    color: #fff;
    text-align: center;
    background-color: #000;
    border-radius: 0.25rem;
  }
  
  .arrow {
    position: absolute;
    display: block;
    width: 0.8rem;
    height: 0.4rem;
  }
  
  .bs-tooltip-top .arrow {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .bs-tooltip-top .arrow::before {
    top: 0;
    border-width: 0.4rem 0.4rem 0;
    border-top-color: #000;
  }
  
  .bs-tooltip-bottom .arrow {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .bs-tooltip-bottom .arrow::before {
    bottom: 0;
    border-width: 0 0.4rem 0.4rem;
    border-bottom-color: #000;
  }
  
  .bs-tooltip-left .arrow {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .bs-tooltip-left .arrow::before {
    left: 0;
    border-width: 0.4rem 0 0.4rem 0.4rem;
    border-left-color: #000;
  }
  
  .bs-tooltip-right .arrow {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .bs-tooltip-right .arrow::before {
    right: 0;
    border-width: 0.4rem 0.4rem 0.4rem 0;
    border-right-color: #000;
  }
  
  .fade {
    transition: opacity 0.15s linear;
  }
  
  .show {
    opacity: 0.9;
  }
</style>