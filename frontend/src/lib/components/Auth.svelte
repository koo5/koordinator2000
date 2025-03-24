<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user } from '$lib/stores';
  import { browser } from '$app/environment';
  import { login, logout, checkAuth } from '$lib/client/auth';
  
  export let redirectTo = '/';
  
  let loading = true;
  let error = null;
  let email = '';
  let password = '';
  
  onMount(async () => {
    if (!browser) return;
    
    try {
      // Check if user is already logged in
      const isLoggedIn = await checkAuth();
      
      if (isLoggedIn && $page.url.pathname === '/login') {
        // If on login page but already logged in, redirect
        window.location.href = redirectTo;
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  async function handleLogin(useCredentials = false) {
    loading = true;
    error = null;
    
    try {
      if (useCredentials && email && password) {
        // Use the client auth login with credentials
        await login(email, password, redirectTo);
      } else {
        // Use the client auth login as guest
        await login(null, null, redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      error = err.message || 'Failed to login';
    } finally {
      loading = false;
    }
  }
  
  function handleLogout() {
    // Use the client auth logout function
    logout();
  }
</script>

{#if loading}
  <div class="loading">Loading...</div>
{:else}
  <slot login={handleLogin} logout={handleLogout} {error} />
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
