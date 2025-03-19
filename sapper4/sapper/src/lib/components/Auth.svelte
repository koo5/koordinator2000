<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user } from '$lib/stores';
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
        user.set(JSON.parse(storedUser));
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
  
  async function login() {
    loading = true;
    error = null;
    
    try {
      // Get a free user ID if we don't have one
      const response = await fetch(getApiUrl('/get_free_user_id'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user ID');
      }
      
      const userData = await response.json();
      
      // Store user data
      user.set(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect after successful login
      goto(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      error = err.message || 'Failed to login';
    } finally {
      loading = false;
    }
  }
  
  function logout() {
    user.set(null);
    localStorage.removeItem('user');
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
