<script>
  export let navbar = false;
</script>

<ul class="nav {navbar ? 'navbar-nav' : ''}" {...$$restProps}>
  <slot />
</ul>

<style>
  .nav {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
  }
  
  .navbar-nav {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
  }
  
  @media (min-width: 768px) {
    .navbar-nav {
      flex-direction: row;
    }
  }
</style>