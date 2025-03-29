<script lang='js'>
  import {
    authError,
    authToken,
    idToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userInfo,
  } from '$lib/auth';
  import {get} from 'svelte/store';
  import {page} from '$app/stores';
  import {my_user, auth_event} from '../my_user.ts';
  import {browser} from '$app/environment';
</script>

{#if browser}
  <br/>

  {#if $isAuthenticated}
    <div class="auth-status authenticated">
      <p>You are authenticated as: {JSON.stringify($my_user?.auth?.keycloak?.info?.preferred_username || $my_user?.auth?.keycloak?.info?.sub)}</p>
      <button class="btn btn-outline-secondary" on:click|preventDefault='{() => logout() }'>Sign Out</button>
    </div>
  {:else}
    <div class="auth-status unauthenticated">
      <p>You are not authenticated.</p>
      <button class="btn btn-primary" on:click|preventDefault='{() => login() }'>
        Sign In with Keycloak
      </button>
    </div>
  {/if}

  {#if $my_user.auth_debug}
    <div class="auth-debug">
      <h4>Auth Debug Information</h4>
      <pre>isLoading: {$isLoading}</pre>
      <pre>isAuthenticated: {$isAuthenticated}</pre>
      <pre>authToken: {$authToken}</pre>
      <pre>idToken: {$idToken}</pre>
      <pre>userInfo: {JSON.stringify($userInfo, null, 2)}</pre>
      <pre>authError: {$authError}</pre>
      
      <h5>Page Info:</h5>
      <pre>{JSON.stringify($page, null, '  ')}</pre>
    </div>
  {/if}
{:else}
  <div class="loading">
    <div class="animate-flicker">Loading authentication...</div>
  </div>
{/if}

<style>
  .auth-status {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .authenticated {
    background-color: rgba(0, 128, 0, 0.1);
  }
  
  .unauthenticated {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .auth-debug {
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f8f9fa;
  }
  
  .auth-debug h4, .auth-debug h5 {
    color: #343a40;
  }
  
  .auth-debug pre {
    background-color: #f1f1f1;
    padding: 0.5rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }
  
  .loading {
    text-align: center;
    padding: 1rem;
    color: #6c757d;
  }
  
  .animate-flicker {
    animation: flicker 1.5s infinite alternate;
  }
  
  @keyframes flicker {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.5;
    }
  }
</style>