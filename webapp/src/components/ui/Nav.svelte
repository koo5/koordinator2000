<script>
  let className = '';
  export { className as class };
  export let navbar = false;
</script>

<ul class="nav {className} {navbar ? 'navbar-nav' : ''}" {...$$restProps}>
  <slot></slot>
</ul>