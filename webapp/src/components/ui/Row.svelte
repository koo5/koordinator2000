<script lang="ts">
  // Custom properties to match sveltestrap
  export let noGutters = false;
  export let form = false;
</script>

<div 
  class="row" 
  class:no-gutters={noGutters}
  class:form-row={form}
  {...$$restProps}
>
  <slot />
</div>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
  }

  .no-gutters {
    margin-right: 0;
    margin-left: 0;
  }

  .no-gutters > :global(*) {
    padding-right: 0;
    padding-left: 0;
  }

  .form-row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -5px;
    margin-left: -5px;
  }

  .form-row > :global(*) {
    padding-right: 5px;
    padding-left: 5px;
  }
</style>
