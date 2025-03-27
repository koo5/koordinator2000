<script>
  let className = '';
  export { className as class };
  export let value = 0;
  export let max = 100;
  export let animated = false;
  export let striped = false;
  export let color = '';
  export let bar = false;
  export let multi = false;
  
  let progressClasses = '';
  
  $: progressClasses = [
    'progress',
    className
  ].filter(Boolean).join(' ');
  
  let barClasses = '';
  
  $: barClasses = [
    'progress-bar',
    color && `bg-${color}`,
    animated && 'progress-bar-animated',
    striped && 'progress-bar-striped'
  ].filter(Boolean).join(' ');
  
  $: width = Math.round((value / max) * 100);
</script>

{#if bar}
  <div class={barClasses} 
      role="progressbar" 
      style="width: {width}%" 
      aria-valuenow={value} 
      aria-valuemin="0" 
      aria-valuemax={max}
      {...$$restProps}>
    <slot></slot>
  </div>
{:else}
  <div class={progressClasses} {...$$restProps}>
    {#if multi}
      <slot></slot>
    {:else}
      <div class={barClasses} 
          role="progressbar" 
          style="width: {width}%" 
          aria-valuenow={value} 
          aria-valuemin="0" 
          aria-valuemax={max}>
        <slot></slot>
      </div>
    {/if}
  </div>
{/if}