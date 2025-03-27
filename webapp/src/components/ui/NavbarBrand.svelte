<script>
  let className = '';
  export { className as class };
  export let href = '/';
</script>

<a class="navbar-brand {className}" {href} {...$$restProps}>
  <slot></slot>
</a>