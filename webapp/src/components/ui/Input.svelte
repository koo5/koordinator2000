<script>
  export let type = 'text';
  export let name = undefined;
  export let id = undefined;
  export let class_ = undefined;
  export let placeholder = undefined;
  export let value = undefined;
  export let readonly = false;
  export let disabled = false;
  export let valid = true;
  export let invalid = false;
  export let bsSize = undefined;
  export let checked = false;
  export let multiple = false;
  
  let classes = '';
  
  $: {
    let sizeClass = bsSize ? `form-control-${bsSize}` : '';
    classes = `${class_ || ''} form-control ${sizeClass} ${valid ? 'is-valid' : ''} ${invalid ? 'is-invalid' : ''}`.trim();
  }
</script>

{#if type === 'text'}
  <input
    type="text"
    {name}
    {id}
    class={classes}
    {placeholder}
    bind:value
    {readonly}
    {disabled}
    on:blur
    on:change
    on:click
    on:focus
    on:input
    on:keydown
    on:keypress
    on:keyup
    on:mousedown
    on:mouseup
    {...$$restProps}
  />
{:else if type === 'password'}
  <input
    type="password"
    {name}
    {id}
    class={classes}
    {placeholder}
    bind:value
    {readonly}
    {disabled}
    on:blur
    on:change
    on:click
    on:focus
    on:input
    on:keydown
    on:keypress
    on:keyup
    on:mousedown
    on:mouseup
    {...$$restProps}
  />
{:else if type === 'checkbox'}
  <input
    type="checkbox"
    {name}
    {id}
    class={classes}
    bind:checked={value}
    {readonly}
    {disabled}
    on:blur
    on:change
    on:click
    on:focus
    on:input
    on:keydown
    on:keypress
    on:keyup
    on:mousedown
    on:mouseup
    {...$$restProps}
  />
{:else if type === 'file'}
  <input
    type="file"
    {name}
    {id}
    class={classes}
    {placeholder}
    {readonly}
    {disabled}
    {multiple}
    on:blur
    on:change
    on:click
    on:focus
    on:input
    on:keydown
    on:keypress
    on:keyup
    on:mousedown
    on:mouseup
    {...$$restProps}
  />
{:else}
  <input
    type={type}
    {name}
    {id}
    class={classes}
    {placeholder}
    value={value || ''}
    {readonly}
    {disabled}
    {checked}
    {multiple}
    on:blur
    on:change
    on:click
    on:focus
    on:input
    on:keydown
    on:keypress
    on:keyup
    on:mousedown
    on:mouseup
    {...$$restProps}
  />
{/if}