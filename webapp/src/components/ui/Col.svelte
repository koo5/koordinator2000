<script lang="ts">
  // Types for column sizes
  type ColSize = boolean | number | 'auto';

  export let xs: ColSize = false; 
  export let sm: ColSize = false;
  export let md: ColSize = false;
  export let lg: ColSize = false;
  export let xl: ColSize = false;
  export let auto: boolean = false;

  // Convert numbers to appropriate class strings
  function getColClass(size: string, value: ColSize): string {
    if (value === true) return `col-${size}`;
    if (value === 'auto') return `col-${size}-auto`;
    if (typeof value === 'number') return `col-${size}-${value}`;
    return '';
  }

  // Compute classes
  $: xsClass = xs ? (xs === true ? 'col' : xs === 'auto' ? 'col-auto' : `col-${xs}`) : '';
  $: smClass = getColClass('sm', sm);
  $: mdClass = getColClass('md', md);
  $: lgClass = getColClass('lg', lg);
  $: xlClass = getColClass('xl', xl);
</script>

<div class="col {auto ? 'col-auto' : ''} {xsClass} {smClass} {mdClass} {lgClass} {xlClass}" {...$$restProps}>
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