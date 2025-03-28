<script>
  export let row = false;
  export let check = false;
  export let inline = false;
  export let disabled = false;
  export let className = undefined;

  let classes = '';

  $: {
    classes = `form-group ${check ? 'form-check' : ''} ${row ? 'row' : ''} ${inline ? 'form-check-inline' : ''} ${disabled ? 'disabled' : ''} ${className || ''}`.trim();
  }
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>