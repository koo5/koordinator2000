<script>
  import { addNotification } from '$lib/stores';
  
  let email = '';
  let loading = false;
  let submitted = false;
  let error = null;
  
  async function resetPassword() {
    loading = true;
    error = null;
    
    // Validate email
    if (!email) {
      error = 'Email is required';
      loading = false;
      return;
    }
    
    try {
      // In a real app, this would call an API endpoint to send a reset email
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      submitted = true;
      addNotification('Password reset instructions sent to your email', 'success');
    } catch (err) {
      console.error('Password reset error:', err);
      error = err.message || 'Failed to send reset instructions';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Forgot Password | Koordinator</title>
</svelte:head>

<div class="forgot-password-container">
  <div class="forgot-password-card">
    <h1>Forgot Password</h1>
    
    {#if !submitted}
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      <p class="instructions">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <form on:submit|preventDefault={resetPassword}>
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
        
        <button type="submit" class="reset-button" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
    {:else}
      <div class="success">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        
        <h2>Check Your Email</h2>
        
        <p>
          We've sent password reset instructions to <strong>{email}</strong>.
          Please check your inbox and follow the instructions to reset your password.
        </p>
      </div>
    {/if}
    
    <div class="links">
      <a href="/login">Back to Login</a>
    </div>
  </div>
</div>

<style>
  .forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    padding: 2rem 1rem;
  }
  
  .forgot-password-card {
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
  
  .instructions {
    margin-bottom: 1.5rem;
    color: #666;
    text-align: center;
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
  
  .reset-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .reset-button:hover:not(:disabled) {
    background-color: #e63600;
  }
  
  .reset-button:disabled {
    background-color: #ffaa90;
    cursor: not-allowed;
  }
  
  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: #4caf50;
    margin: 2rem 0;
  }
  
  .success svg {
    margin-bottom: 1rem;
  }
  
  .success h2 {
    margin-bottom: 1rem;
    color: #4caf50;
  }
  
  .success p {
    color: #666;
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
