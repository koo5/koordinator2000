<script lang="ts">
  // Column widths for different breakpoints
  export let xs: string | number | undefined = undefined;
  export let sm: string | number | undefined = undefined;
  export let md: string | number | undefined = undefined;
  export let lg: string | number | undefined = undefined;
  export let xl: string | number | undefined = undefined;

  // Calculate classes based on props
  $: classes = [
    // Bootstrap-style column classes
    xs && (xs === 'auto' ? 'col-auto' : `col-${xs}`),
    sm && (sm === 'auto' ? 'col-sm-auto' : `col-sm-${sm}`),
    md && (md === 'auto' ? 'col-md-auto' : `col-md-${md}`),
    lg && (lg === 'auto' ? 'col-lg-auto' : `col-lg-${lg}`),
    xl && (xl === 'auto' ? 'col-xl-auto' : `col-xl-${xl}`),
    // If no width specified, just use col
    !xs && !sm && !md && !lg && !xl && 'col'
  ].filter(Boolean).join(' ');
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>

<style>
  /* Basic column styles */
  [class*="col-"] {
    position: relative;
    width: 100%;
    min-height: 1px;
    padding-right: 15px;
    padding-left: 15px;
  }

  .col {
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
  }

  .col-auto {
    flex: 0 0 auto;
    width: auto;
    max-width: none;
  }

  /* Column width styles */
  .col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-3 { flex: 0 0 25%; max-width: 25%; }
  .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .col-6 { flex: 0 0 50%; max-width: 50%; }
  .col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-9 { flex: 0 0 75%; max-width: 75%; }
  .col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .col-12 { flex: 0 0 100%; max-width: 100%; }

  /* Responsive columns */
  @media (min-width: 576px) {
    .col-sm-auto { flex: 0 0 auto; width: auto; max-width: none; }
    .col-sm-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
    .col-sm-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
    .col-sm-3 { flex: 0 0 25%; max-width: 25%; }
    .col-sm-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
    .col-sm-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
    .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
    .col-sm-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
    .col-sm-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
    .col-sm-9 { flex: 0 0 75%; max-width: 75%; }
    .col-sm-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
    .col-sm-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
    .col-sm-12 { flex: 0 0 100%; max-width: 100%; }
  }

  @media (min-width: 768px) {
    .col-md-auto { flex: 0 0 auto; width: auto; max-width: none; }
    .col-md-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
    .col-md-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
    .col-md-3 { flex: 0 0 25%; max-width: 25%; }
    .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
    .col-md-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
    .col-md-6 { flex: 0 0 50%; max-width: 50%; }
    .col-md-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
    .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
    .col-md-9 { flex: 0 0 75%; max-width: 75%; }
    .col-md-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
    .col-md-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
    .col-md-12 { flex: 0 0 100%; max-width: 100%; }
  }

  @media (min-width: 992px) {
    .col-lg-auto { flex: 0 0 auto; width: auto; max-width: none; }
    .col-lg-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
    .col-lg-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
    .col-lg-3 { flex: 0 0 25%; max-width: 25%; }
    .col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
    .col-lg-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
    .col-lg-6 { flex: 0 0 50%; max-width: 50%; }
    .col-lg-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
    .col-lg-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
    .col-lg-9 { flex: 0 0 75%; max-width: 75%; }
    .col-lg-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
    .col-lg-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
    .col-lg-12 { flex: 0 0 100%; max-width: 100%; }
  }

  @media (min-width: 1200px) {
    .col-xl-auto { flex: 0 0 auto; width: auto; max-width: none; }
    .col-xl-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
    .col-xl-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
    .col-xl-3 { flex: 0 0 25%; max-width: 25%; }
    .col-xl-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
    .col-xl-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
    .col-xl-6 { flex: 0 0 50%; max-width: 50%; }
    .col-xl-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
    .col-xl-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
    .col-xl-9 { flex: 0 0 75%; max-width: 75%; }
    .col-xl-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
    .col-xl-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
    .col-xl-12 { flex: 0 0 100%; max-width: 100%; }
  }
</style>
