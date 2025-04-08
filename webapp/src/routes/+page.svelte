<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    import { browser } from '$app/environment';
    
    // Check for auth errors - safely handle during SSR
    let authError: string | null = $page?.url?.searchParams?.get('auth_error') || null;
    let errorDescription: string | null = $page?.url?.searchParams?.get('error_description') || null;
    
    // Auto-dismiss error after 5 seconds
    let showError: boolean = !!authError;
    
    onMount(() => {
        if (!browser) return;
        
        if (showError) {
            const timer = setTimeout(() => {
                showError = false;
                // Only redirect if on the home page with an error
                if (window.location.pathname === '/' && window.location.search.includes('auth_error')) {
                    goto('/campaigns', { replaceState: true });
                }
            }, 5000);
            
            return () => clearTimeout(timer);
        } else {
            // Only redirect if directly on the home page with no params
            if (window.location.pathname === '/' && !window.location.search) {
                goto('/campaigns');
            }
        }
    });
    
    function dismissError(): void {
        showError = false;
        goto('/campaigns', { replaceState: true });
    }
</script>

{#if showError}
<div class="auth-error-container">
    <div class="auth-error">
        <button class="close-button" on:click={dismissError}>×</button>
        <h4>Authentication Error</h4>
        <p>There was a problem with authentication: {authError}</p>
        {#if errorDescription}
            <p class="error-details">{errorDescription}</p>
        {/if}
        <p>Please try again or contact support if the problem persists.</p>
    </div>
</div>
{/if}

<style>
    .auth-error-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        max-width: 400px;
    }
    
    .auth-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 0.25rem;
        box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
        position: relative;
    }
    
    .close-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #721c24;
    }
    
    .error-details {
        font-size: 0.875rem;
        margin-top: 0.5rem;
        color: #721c24;
        opacity: 0.8;
    }
</style>