<script>
  import { user } from '$lib/stores';
  import Auth from '$lib/components/Auth.svelte';
  
  export let data;
</script>

<svelte:head>
  <title>Your Profile | Koordinator</title>
</svelte:head>

<Auth let:logout>
  <div class="profile-container">
    <h1>Your Profile</h1>
    
    {#if data.user}
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            {data.user.name.charAt(0).toUpperCase()}
          </div>
          <h2>{data.user.name}</h2>
        </div>
        
        <div class="profile-details">
          <div class="detail-item">
            <span class="label">User ID:</span>
            <span class="value">{data.user.id}</span>
          </div>
          
          {#if data.user.email}
            <div class="detail-item">
              <span class="label">Email:</span>
              <span class="value">{data.user.email}</span>
            </div>
          {/if}
          
          {#if data.user.jwt}
            <div class="detail-item">
              <span class="label">Auth Token:</span>
              <span class="value token">{data.user.jwt.substring(0, 20)}...</span>
            </div>
          {/if}
        </div>
        
        <div class="actions">
          <button class="edit-button">Edit Profile</button>
          <button class="logout-button" on:click={logout}>Logout</button>
        </div>
      </div>
    {:else}
      <p>Loading user data...</p>
    {/if}
  </div>
</Auth>

<style>
  .profile-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .profile-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .profile-header {
    background-color: #ff3e00;
    color: white;
    padding: 2rem;
    text-align: center;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
    background-color: white;
    color: #ff3e00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    margin: 0 auto 1rem;
  }
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .profile-details {
    padding: 2rem;
  }
  
  .detail-item {
    display: flex;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .detail-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .label {
    font-weight: bold;
    width: 100px;
    color: #666;
  }
  
  .value {
    flex: 1;
    word-break: break-word;
  }
  
  .token {
    font-family: monospace;
    font-size: 0.85em;
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  .actions {
    display: flex;
    padding: 1rem 2rem 2rem;
    gap: 1rem;
  }
  
  button {
    flex: 1;
    padding: 0.75rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .edit-button {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .logout-button {
    background-color: #ff3e00;
    color: white;
  }
  
  .edit-button:hover {
    background-color: #e0e0e0;
  }
  
  .logout-button:hover {
    background-color: #e63600;
  }
</style>
