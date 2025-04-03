<script lang="ts">
    import { page } from '$app/stores';
    import { my_user } from '../my_user.ts';
    import { browser } from '$app/environment';
    import { public_env } from '$lib/public_env';
    import { 
        isAuthenticated, 
        keycloakProfile, 
        login as keycloakLogin, 
        logout as keycloakLogout,
        accountManagement,
        keycloakError,
        isKeycloakInitialized
    } from '$lib/client/keycloak';
    
    // Flag to determine if Keycloak is enabled
    const enableKeycloak = public_env.ENABLE_KEYCLOAK;
    
    // Function to handle login
    function handleLogin() {
        if (enableKeycloak) {
            keycloakLogin();
        }
    }
    
    // Function to handle logout
    function handleLogout() {
        if (enableKeycloak) {
            keycloakLogout();
        }
    }
    
    // Function to manage account
    function handleAccountManagement() {
        accountManagement();
    }
</script>

{#if browser}
    <br />

    {#if enableKeycloak}
        {#if $isKeycloakInitialized}
            {#if $isAuthenticated}
                <div class="auth-status authenticated">
                    <p>You are authenticated as: 
                        {#if $keycloakProfile?.preferred_username}
                            {$keycloakProfile.preferred_username}
                        {:else if $keycloakProfile?.name}
                            {$keycloakProfile.name}
                        {:else if $my_user?.auth?.keycloak?.info?.preferred_username}
                            {$my_user.auth.keycloak.info.preferred_username}
                        {:else if $my_user?.auth?.keycloak?.info?.sub}
                            {$my_user.auth.keycloak.info.sub}
                        {:else}
                            Unknown User
                        {/if}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" on:click|preventDefault={handleAccountManagement}>Manage Account</button>
                        <button class="btn btn-sm btn-outline-secondary" on:click|preventDefault={handleLogout}>Sign Out</button>
                    </div>
                </div>
            {:else}
                <div class="auth-status unauthenticated">
                    <p>You are not authenticated with Keycloak.</p>
                    <button class="btn btn-primary" on:click|preventDefault={handleLogin}>Sign In with Keycloak</button>
                </div>
            {/if}
            
            {#if $keycloakError}
                <div class="auth-error">
                    <p>Authentication error: {$keycloakError.message}</p>
                </div>
            {/if}
        {:else}
            <div class="loading">
                <div class="animate-flicker">Initializing Keycloak...</div>
            </div>
        {/if}
    {:else}
        <div class="auth-status keycloak-disabled">
            <p>Keycloak integration is disabled. Enable it in your environment configuration.</p>
        </div>
    {/if}

    {#if $my_user.auth_debug}
        <div class="auth-debug">
            <h4>Auth Debug Information</h4>
            <pre>Keycloak Enabled: {enableKeycloak}</pre>
            <pre>Keycloak Initialized: {$isKeycloakInitialized}</pre>
            <pre>isAuthenticated: {$isAuthenticated}</pre>
            <pre>Keycloak Profile: {JSON.stringify($keycloakProfile, null, 2)}</pre>
            <pre>Keycloak Error: {$keycloakError?.message}</pre>
            <pre>My User: {JSON.stringify($my_user, null, 2)}</pre>

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

    .keycloak-disabled {
        background-color: rgba(255, 165, 0, 0.1);
    }

    .auth-error {
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        background-color: rgba(255, 0, 0, 0.1);
        color: #721c24;
    }

    .btn-group {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .auth-debug {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #f8f9fa;
    }

    .auth-debug h4,
    .auth-debug h5 {
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