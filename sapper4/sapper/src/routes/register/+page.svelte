<script>
  import { goto } from '$app/navigation';
  import { user, addNotification } from '$lib/stores';
  import { fetchJson } from '$lib/fetch-utils';
  import { getApiUrl } from '$lib/env';
  
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let error = null;
  
  async function register() {
    loading = true;
    error = null;
    
    // Validate form
    if (!name || !email || !password) {
      error = 'All fields are required';
      loading = false;
      return;
    }
    
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      loading = false;
      return;
    }
    
    try {
      // Register user
      const response = await fetch(getApiUrl('/get_free_user_id'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const userData = await response.json();
      
      // Store user data
      user.set(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth header for future requests
      if (userData.jwt) {
        window.authToken = userData.jwt;
      }
      
      // Show success notification
      addNotification('Registration successful! Welcome to Koordinator.', 'success');
      
      // Redirect to home page
      goto('/');
    } catch (err) {
      console.error('Registration error:', err);
      error = err.message || 'Failed to register';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register | Koordinator</title>
</svelte:head>

<div class="register-container">
  <div class="register-card">
    <h1>Create Account</h1>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={register}>
      <div class="form-group">
        <label for="name">Username</label>
        <input 
          type="text" 
          id="name" 
          bind:value={name} 
          placeholder="Choose a username"
          required
        />
      </div>
      
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
          placeholder="Create a password"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input 
          type="password" 
          id="confirm-password" 
          bind:value={confirmPassword} 
          placeholder="Confirm your password"
          required
        />
      </div>
      
      <button type="submit" class="register-button" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
    
    <div class="links">
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  </div>
</div>

<style>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    padding: 2rem 1rem;
  }
  
  .register-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
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
    margin-bottom: 1.5rem;
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
  
  .register-button {
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
  
  .register-button:hover:not(:disabled) {
    background-color: #e63600;
  }
  
  .register-button:disabled {
    background-color: #ffaa90;
    cursor: not-allowed;
  }
  
  .links {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .links a {
    color: #ff3e00;
    text-decoration: none;
    font-weight: bold;
  }
  
  .links a:hover {
    text-decoration: underline;
  }
</style>
