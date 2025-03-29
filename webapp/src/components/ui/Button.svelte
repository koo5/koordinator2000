<script lang="ts">
  // Define the allowed button types
  type ButtonType = 'button' | 'submit' | 'reset';
  
  // Define the allowed color variants
  type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  
  // Define the allowed size variants
  type ButtonSize = 'sm' | 'lg' | '';
  
  // Component props with TypeScript types
  export let color: ButtonColor = "primary";
  export let outline: boolean = false;
  export let size: ButtonSize = "";
  export let disabled: boolean = false;
  export let type: ButtonType = "button";
</script>

<button 
  {type}
  class="btn {outline ? 'btn-outline-' : 'btn-'}{color} {size ? `btn-${size}` : ''}"
  {disabled}
  on:click
  {...$$restProps}
>
  <slot />
</button>

<style>
  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  }
  
  button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  
  /* Primary */
  .btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
  }
  
  /* Secondary */
  .btn-secondary {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
  }
  
  /* Success */
  .btn-success {
    color: #fff;
    background-color: #28a745;
    border-color: #28a745;
  }
  
  /* Danger */
  .btn-danger {
    color: #fff;
    background-color: #dc3545;
    border-color: #dc3545;
  }
</style>