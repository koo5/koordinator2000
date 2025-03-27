<script>
  let className = '';
  export { className as class };
  export let href = '#';
  export let active = false;

  function handleClick(event) {
    if (href === 'javascript:void(0)') {
      event.preventDefault();
    }
  }
</script>

<a 
  {href} 
  class="nav-link {className} {active ? 'active' : ''}"
  on:click={handleClick}
  on:click
  on:keydown
  {...$$restProps}>
  <slot></slot>
</a>

<style>
  .active {
    font-weight: bold;
  }
</style>