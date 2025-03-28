<script>
  export let responsive = false;
  export let striped = false;
  export let bordered = false;
  export let hover = false;
</script>

<div class={responsive ? 'table-responsive' : ''}>
  <table class="table {striped ? 'table-striped' : ''} {bordered ? 'table-bordered' : ''} {hover ? 'table-hover' : ''}" {...$$restProps}>
    <slot />
  </table>
</div>

<style>
  .table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
    border-collapse: collapse;
  }
  
  /* Apply styles to all cells regardless of whether they're currently rendered */
  :global(.table th),
  :global(.table td) {
    padding: 0.75rem;
    vertical-align: top;
    border-top: 1px solid #dee2e6;
  }
  
  :global(.table thead th) {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
  }
  
  :global(.table-striped tbody tr:nth-of-type(odd)) {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .table-bordered {
    border: 1px solid #dee2e6;
  }
  
  :global(.table-bordered th),
  :global(.table-bordered td) {
    border: 1px solid #dee2e6;
  }
  
  :global(.table-hover tbody tr:hover) {
    background-color: rgba(0, 0, 0, 0.075);
  }
  
  .table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
</style>