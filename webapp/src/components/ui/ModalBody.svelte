<script>
  let className = '';
  export { className as class };
</script>

<div class="modal-body {className}" {...$$restProps}>
  <slot></slot>
</div>