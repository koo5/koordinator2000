<script>
  export let href = "/";
</script>

<a {href} class="navbar-brand" {...$$restProps}>
  <slot />
</a>

<style>
  .navbar-brand {
    display: inline-block;
    padding-top: 0.3125rem;
    padding-bottom: 0.3125rem;
    margin-right: 1rem;
    font-size: 1.25rem;
    line-height: inherit;
    white-space: nowrap;
    text-decoration: none;
    color: inherit;
  }
</style>