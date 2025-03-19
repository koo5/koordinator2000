<script>
  import { user } from '$lib/stores';
</script>

<svelte:head>
  <title>About | Koordinator</title>
</svelte:head>

<div class="about-container">
  <h1>About Koordinator</h1>
  
  <div class="content">
    <p>
      Koordinator is a platform for coordinating campaigns and actions. It helps people organize
      and participate in various initiatives.
    </p>
    
    <p>
      This application has been migrated from Sapper to SvelteKit, providing better performance,
      improved developer experience, and more modern features.
    </p>
    
    {#if $user}
      <div class="user-info">
        <p>You are currently logged in as <strong>{$user.name}</strong>.</p>
      </div>
    {:else}
      <div class="login-prompt">
        <p>You are not logged in. <a href="/login">Login</a> to access all features.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .about-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .user-info, .login-prompt {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .user-info {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
  }
  
  .login-prompt {
    background-color: #fff8e1;
    border-left: 4px solid #ffc107;
  }
  
  a {
    color: #ff3e00;
    text-decoration: none;
    font-weight: bold;
  }
  
  a:hover {
    text-decoration: underline;
  }
</style>
