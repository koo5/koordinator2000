<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, addNotification } from '$lib/stores';
  import { getApiUrl } from '$lib/env';
  
  export let redirectTo = '/';
  
  let loading = true;
  let error = null;
  let email = '';
  let password = '';
  
  onMount(async () => {
    try {
      // Check if user is already logged in
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        user.set(userData);
        
        // Set auth header for future requests
        if (userData.jwt) {
          window.authToken = userData.jwt;
        }
        
        if ($page.url.pathname === '/login') {
          goto(redirectTo);
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      loading = false;
    }
  });
  
  async function login(useCredentials = false) {
    loading = true;
    error = null;
    
    try {
      let userData;
      
      if (useCredentials && email && password) {
        // This would be a real login with credentials
        // For now, we'll just use the free user ID endpoint
        const response = await fetch(getApiUrl('/get_free_user_id'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to login with credentials');
        }
        
        userData = await response.json();
      } else {
        // Get a free user ID (guest login)
        const response = await fetch(getApiUrl('/get_free_user_id'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user ID');
        }
        
        userData = await response.json();
      }
      
      // Store user data
      user.set(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth header for future requests
      if (userData.jwt) {
        window.authToken = userData.jwt;
      }
      
      // Show success notification
      addNotification('Successfully logged in', 'success');
      
      // Redirect after successful login
      goto(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      error = err.message || 'Failed to login';
      addNotification(error, 'error');
    } finally {
      loading = false;
    }
  }
  
  function logout() {
    user.set(null);
    localStorage.removeItem('user');
    window.authToken = null;
    addNotification('Successfully logged out', 'info');
    goto('/login');
  }
</script>

{#if loading}
  <div class="loading">Loading...</div>
{:else}
  <slot {login} {logout} {error} />
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    font-style: italic;
    color: #888;
  }
</style>
