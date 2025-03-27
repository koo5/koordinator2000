<script>
  let className = '';
  export { className as class };
</script>

<button 
  class="navbar-toggler {className}" 
  type="button" 
  aria-label="Toggle navigation"
  on:click
  on:keydown
  {...$$restProps}>
  <span class="navbar-toggler-icon"></span>
</button>