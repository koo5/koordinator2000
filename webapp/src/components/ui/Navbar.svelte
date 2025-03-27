<script lang="ts">
  export let expand = 'md'; // sm, md, lg, xl
  export let color = 'light'; // light, dark
  export let dark = false;
  export let light = true;
  export let fixed = ''; // top, bottom
  export let sticky = '';

  $: navbarClasses = [
    'navbar',
    expand && `navbar-expand-${expand}`,
    color && `bg-${color}`,
    dark && 'navbar-dark',
    light && !dark && 'navbar-light',
    fixed && `fixed-${fixed}`,
    sticky && `sticky-${sticky}`,
  ].filter(Boolean).join(' ');
</script>

<nav class={navbarClasses} {...$$restProps}>
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
  }

  .navbar-light {
    color: rgba(0, 0, 0, 0.5);
  }

  .navbar-dark {
    color: rgba(255, 255, 255, 0.5);
  }

  .bg-light {
    background-color: #f8f9fa !important;
  }

  .bg-dark {
    background-color: #343a40 !important;
  }

  /* Positioning classes */
  .fixed-top {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1030;
  }

  .fixed-bottom {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1030;
  }

  .sticky-top {
    position: sticky;
    top: 0;
    z-index: 1020;
  }

  /* Responsive classes */
  @media (min-width: 576px) {
    .navbar-expand-sm {
      flex-flow: row nowrap;
      justify-content: flex-start;
    }
  }

  @media (min-width: 768px) {
    .navbar-expand-md {
      flex-flow: row nowrap;
      justify-content: flex-start;
    }
  }

  @media (min-width: 992px) {
    .navbar-expand-lg {
      flex-flow: row nowrap;
      justify-content: flex-start;
    }
  }

  @media (min-width: 1200px) {
    .navbar-expand-xl {
      flex-flow: row nowrap;
      justify-content: flex-start;
    }
  }
</style>
