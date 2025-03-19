<script>
  import Auth from '$lib/components/Auth.svelte';
  import { page } from '$app/stores';
  
  // Get the redirect URL from the query parameter or default to home
  $: redirectTo = $page.url.searchParams.get('redirectTo') || '/';
  
  let email = '';
  let password = '';
  
  function handleCredentialLogin(login) {
    login(true); // true indicates using credentials
  }
</script>

<svelte:head>
  <title>Login | Koordinator</title>
</svelte:head>

<div class="login-container">
  <Auth {redirectTo} let:login let:error>
    <div class="login-card">
      <h1>Login</h1>
      
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      <form on:submit|preventDefault={() => handleCredentialLogin(login)}>
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            bind:value={password} 
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" class="login-button">Login</button>
      </form>
      
      <div class="alternative-login">
        <p>Or login with:</p>
        <button class="guest-login" on:click={() => login(false)}>Continue as Guest</button>
      </div>
      
      <div class="links">
        <a href="/register">Create an account</a>
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </div>
  </Auth>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
  }
  
  .login-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  h1 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  .login-button:hover {
    background-color: #e63600;
  }
  
  .alternative-login {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .alternative-login p {
    margin-bottom: 0.5rem;
    color: #666;
  }
  
  .guest-login {
    width: 100%;
    padding: 0.75rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .guest-login:hover {
    background-color: #e0e0e0;
  }
  
  .links {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }
  
  .links a {
    color: #ff3e00;
    text-decoration: none;
  }
  
  .links a:hover {
    text-decoration: underline;
  }
</style>
