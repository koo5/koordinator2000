<script>
  let className = '';
  export { className as class };
  export let color = 'secondary';
  export let size = '';
  export let block = false;
  export let outline = false;
  export let active = false;
  export let disabled = false;

  let buttonClasses = '';
  $: buttonClasses = [
    'btn',
    color && `btn${outline ? '-outline' : ''}-${color}`,
    size && `btn-${size}`,
    block && 'btn-block',
    active && 'active',
    className
  ].filter(Boolean).join(' ');
</script>

<button
  class={buttonClasses}
  on:click
  on:keydown
  {disabled}
  {...$$restProps}>
  <slot></slot>
</button>