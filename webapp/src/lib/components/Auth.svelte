<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { checkAuth, login, logout } from '$lib/client/auth';

    export let redirectTo: string = '/';

    let loading: boolean = true;
    let error: string | null = null;
    let email: string = '';
    let password: string = '';

    onMount(async () => {
        if (!browser) return;

        try {
            // Check if user is already logged in
            const isLoggedIn = await checkAuth();

            if (isLoggedIn && $page.url.pathname === '/login') {
                // If on login page but already logged in, redirect
                window.location.href = redirectTo;
            }
        } catch (err: any) {
            console.error('Auth initialization error:', err);
            error = err.message;
        } finally {
            loading = false;
        }
    });

    async function handleLogin(useCredentials: boolean = false): Promise<void> {
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
        } catch (err: any) {
            console.error('Login error:', err);
            error = err.message || 'Failed to login';
        } finally {
            loading = false;
        }
    }

    function handleLogout(): void {
        // Use the client auth logout function
        logout();
    }
</script>

{#if loading}
    <div class="loading">Auth is loading...</div>
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
