<script>
  /**
   * A simple progress bar component
   * 
   * @component
   */

  // Props with defaults
  /** The current progress value (0-100) */
  export let value = 0;
  
  /** The maximum value (default: 100) */
  export let max = 100;
  
  /** The minimum value (default: 0) */
  export let min = 0;
  
  /** Height of the progress bar in pixels */
  export let height = 10;
  
  /** Whether to show text label */
  export let showLabel = true;
  
  /** Text to display (defaults to percentage) */
  export let label = undefined;
  
  /** Color of the progress bar */
  export let color = "#4a6ee0";
  
  /** Background color */
  export let backgroundColor = "#f5f5f5";
  
  /** Whether to use a striped pattern */
  export let striped = false;
  
  /** Whether to animate the striped pattern */
  export let animated = false;
  
  // Computed values
  $: percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  $: displayLabel = label !== undefined ? label : `${Math.round(percentage)}%`;
  
  // CSS class computation
  $: classes = [
    'progress-bar',
    striped ? 'striped' : '',
    animated && striped ? 'animated' : ''
  ].filter(Boolean).join(' ');
</script>

<div class="progress" style="height: {height}px; background-color: {backgroundColor};">
  <div
    class={classes}
    role="progressbar"
    style="width: {percentage}%; background-color: {color};"
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
  >
    {#if showLabel}
      <span class="progress-label">{displayLabel}</span>
    {/if}
  </div>
</div>

<style>
  .progress {
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .progress-label {
    color: white;
    font-size: 0.8em;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
  }
  
  .striped {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
  }
  
  .animated {
    animation: progress-bar-stripes 1s linear infinite;
  }
  
  @keyframes progress-bar-stripes {
    from {
      background-position: 1rem 0;
    }
    to {
      background-position: 0 0;
    }
  }
</style>