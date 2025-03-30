<script>
  export let href = "#";
  export let active = false;
  export let click;
  
  // Forward the click event when href is not set explicitly
  function handleClick(event) {
    console.log("NavLink clicked");
    if (click) {
      click();
    }
  }
</script>

<a {href} class="nav-link {active ? 'active' : ''}" on:click={handleClick}>
  <slot />
</a>

<style>
  .nav-link {
    display: block;
    padding: 0.5rem 1rem;
    color: #007bff;
    text-decoration: none;
    background-color: transparent;
    transition: color 0.15s ease-in-out;
  }
  
  .nav-link:hover {
    color: #0056b3;
    text-decoration: none;
  }
  
  .active {
    color: #212529;
    font-weight: bold;
  }
</style>