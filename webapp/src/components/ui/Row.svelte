<div class="row" {...$$restProps}>
  <slot />
</div>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
  }
</style>