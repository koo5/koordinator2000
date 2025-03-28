<script>
  export let xs = false; 
  export let sm = false;
  export let md = false;
  export let lg = false;
  export let xl = false;
  export let auto = false;
</script>

<div class="col {auto ? 'col-auto' : ''} {xs ? 'col-xs' : ''} {sm ? 'col-sm' : ''} {md ? 'col-md' : ''} {lg ? 'col-lg' : ''} {xl ? 'col-xl' : ''}" {...$$restProps}>
  <slot />
</div>

<style>
  .col {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
  }
  
  .col-auto {
    flex: 0 0 auto;
    width: auto;
    max-width: 100%;
  }
</style>