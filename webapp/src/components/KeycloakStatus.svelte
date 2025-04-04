<script lang="ts">
    import { my_user } from '../lib/client/my_user.ts';
    import { isAuthenticated, login, logout, keycloakProfile } from '../lib/client/keycloak';
    import { public_env } from '../lib/public_env';
    import { goto } from '$app/navigation';

    // Local state
    let showDropdown = false;

    // Toggle dropdown
    function toggleDropdown() {
        showDropdown = !showDropdown;
    }

    // Close dropdown
    function closeDropdown() {
        showDropdown = false;
    }

    // Handle login
    function handleLogin() {
        closeDropdown();
        login();
    }

    // Handle logout
    function handleLogout() {
        closeDropdown();
        logout();
    }

    // Go to settings
    function goToSettings() {
        closeDropdown();
        goto('/settings');
    }

    // Handle click outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const dropdown = document.querySelector('.keycloak-status-dropdown');

        if (dropdown && !dropdown.contains(target) && !target.matches('.keycloak-status-btn')) {
            showDropdown = false;
        }
    }

    // Add/remove event listener
    function onMount() {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }
</script>

<svelte:window on:load={onMount} />

{#if public_env.ENABLE_KEYCLOAK}
    <div class="keycloak-status">
        <button class="keycloak-status-btn" on:click={toggleDropdown}>
            {#if $isAuthenticated}
                <div class="user-avatar">
                    {($keycloakProfile?.preferred_username || $keycloakProfile?.name || '').substring(0, 1).toUpperCase()}
                </div>
            {:else}
                <div class="login-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                </div>
            {/if}
        </button>

        {#if showDropdown}
            <div class="keycloak-status-dropdown">
                <div class="dropdown-header">
                    {#if $isAuthenticated}
                        <div class="user-info">
                            <span class="username">{$keycloakProfile?.preferred_username || $keycloakProfile?.name || 'User'}</span>
                            {#if $keycloakProfile?.email}
                                <span class="email">{$keycloakProfile.email}</span>
                            {/if}
                        </div>
                    {:else}
                        <div class="auth-prompt">
                            <span>Sign in with Keycloak</span>
                        </div>
                    {/if}
                </div>

                <div class="dropdown-content">
                    {#if $isAuthenticated}
                        <button class="dropdown-item" on:click={goToSettings}>
                            Manage Identity
                        </button>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" on:click={handleLogout}>
                            Sign Out
                        </button>
                    {:else}
                        <button class="dropdown-item" on:click={handleLogin}>
                            Sign In
                        </button>
                        <button class="dropdown-item" on:click={goToSettings}>
                            Manage Identity
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
{/if}

<style>
    .keycloak-status {
        position: relative;
        margin-left: 1rem;
    }

    .keycloak-status-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .login-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
    }

    .keycloak-status-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        min-width: 220px;
        z-index: 1000;
        overflow: hidden;
    }

    .dropdown-header {
        padding: 0.75rem 1rem;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .username {
        font-weight: bold;
        color: #343a40;
    }

    .email {
        font-size: 0.8rem;
        color: #6c757d;
        margin-top: 0.25rem;
    }

    .auth-prompt {
        font-weight: bold;
        color: #343a40;
    }

    .dropdown-content {
        padding: 0.5rem 0;
    }

    .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        font-size: 0.9rem;
        color: #212529;
    }

    .dropdown-item:hover {
        background-color: #f8f9fa;
    }

    .dropdown-divider {
        height: 1px;
        background-color: #e9ecef;
        margin: 0.5rem 0;
    }
</style>
