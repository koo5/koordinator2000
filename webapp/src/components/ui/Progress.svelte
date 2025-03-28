<script>
  export let value = 0;
  export let max = 100;
  export let showValue = false;
  export let striped = false;
  export let animated = false;
  export let color = "primary";
  
  $: percentage = (value / max) * 100;
</script>

<div class="progress" {...$$restProps}>
  <div 
    class="progress-bar bg-{color} {striped ? 'progress-bar-striped' : ''} {animated && striped ? 'progress-bar-animated' : ''}"
    role="progressbar" 
    style="width: {percentage}%" 
    aria-valuenow={value} 
    aria-valuemin="0" 
    aria-valuemax={max}
  >
    {#if showValue}
      <span>{value}%</span>
    {/if}
  </div>
</div>

<style>
  .progress {
    display: flex;
    height: 1rem;
    overflow: hidden;
    background-color: #e9ecef;
    border-radius: 0.25rem;
  }
  
  .progress-bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    transition: width 0.6s ease;
  }
  
  .bg-primary { background-color: #007bff; }
  .bg-secondary { background-color: #6c757d; }
  .bg-success { background-color: #28a745; }
  .bg-danger { background-color: #dc3545; }
  .bg-warning { background-color: #ffc107; }
  
  .progress-bar-striped {
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
    background-size: 1rem 1rem;
  }
  
  .progress-bar-animated {
    animation: progress-bar-stripes 1s linear infinite;
  }
  
  @keyframes progress-bar-stripes {
    from { background-position: 1rem 0; }
    to { background-position: 0 0; }
  }
</style>