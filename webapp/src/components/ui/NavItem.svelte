<script>
  let className = '';
  export { className as class };
  export let active = false;
  export let align = '';
</script>

<li class="nav-item {className} {active ? 'active' : ''} {align === 'right' ? 'ml-auto' : ''}">
  <slot></slot>
</li>