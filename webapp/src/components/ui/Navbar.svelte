<script>
  export let light = false;
  export let dark = false;
  export let expand = "";
</script>

<nav 
  class="navbar {light ? 'navbar-light' : ''} {dark ? 'navbar-dark' : ''} {expand ? `navbar-expand-${expand}` : ''}"
  {...$$restProps}
>
  <slot />
</nav>

<style>
  .navbar {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .navbar-light {
    background-color: #f8f9fa;
    color: rgba(0, 0, 0, 0.9);
  }
  
  .navbar-dark {
    background-color: #343a40;
    color: rgba(255, 255, 255, 0.9);
  }
  
  @media (min-width: 768px) {
    .navbar-expand-md {
      flex-flow: row nowrap;
      justify-content: flex-start;
    }
  }
</style>