<script>
  import { notifications, removeNotification } from '$lib/stores';
</script>

<div class="notifications">
  {#each $notifications as notification (notification.id)}
    <div 
      class="notification" 
      class:info={notification.type === 'info'}
      class:success={notification.type === 'success'}
      class:warning={notification.type === 'warning'}
      class:error={notification.type === 'error'}
    >
      <div class="content">{notification.message}</div>
      <button on:click={() => removeNotification(notification.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .notifications {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px;
  }

  .notification {
    padding: 12px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slide-in 0.3s ease-out;
  }

  .info {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
  }

  .success {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
  }

  .warning {
    background-color: #fff8e1;
    border-left: 4px solid #ffc107;
  }

  .error {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
  }

  .content {
    flex: 1;
    margin-right: 10px;
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }

  button:hover {
    color: #333;
  }

  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
