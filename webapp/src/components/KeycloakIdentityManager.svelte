<script lang="ts">
    import { my_user } from '../lib/client/my_user.ts';
    import {
        isAuthenticated,
        keycloakProfile,
        login,
        logout,
        accountManagement
    } from '../lib/client/keycloak';
    import { public_env } from '../lib/public_env';

    // Local state
    let showMoreInfo = false;

    // Computed values
    $: hasKeycloakAuth = $my_user?.auth?.keycloak?.info?.sub || null;
    $: currentKeycloakUser =
        $keycloakProfile?.preferred_username ||
        $keycloakProfile?.name ||
        $my_user?.auth?.keycloak?.info?.preferred_username ||
        $my_user?.auth?.keycloak?.info?.sub || null;

    $: keycloakEmail = $keycloakProfile?.email || $my_user?.auth?.keycloak?.info?.email || null;

    // Toggle more info display
    function toggleMoreInfo() {
        showMoreInfo = !showMoreInfo;
    }

    // Handle login with Keycloak
    function handleLogin() {
        login();
    }

    // Handle logout from Keycloak
    function handleLogout() {
        logout();
    }

    // Handle account management
    function handleAccountManagement() {
        accountManagement();
    }
</script>

<div class="keycloak-identity-manager">
    <h3>External Identity</h3>

    {#if public_env.ENABLE_KEYCLOAK}
        {#if $isAuthenticated}
            <div class="identity-status authenticated">
                <h4>Linked to Keycloak Identity</h4>

                <div class="identity-info">
                    <div class="info-row">
                        <span class="info-label">Username:</span>
                        <span class="info-value">{currentKeycloakUser || 'Not available'}</span>
                    </div>

                    {#if keycloakEmail}
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{keycloakEmail}</span>
                        </div>
                    {/if}

                    <div class="info-row">
                        <span class="info-label">Koordinator ID:</span>
                        <span class="info-value">{$my_user.id}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value authentication-status">Authenticated</span>
                    </div>
                </div>

                <div class="button-group">
                    <button class="btn btn-sm btn-outline-secondary" on:click={handleAccountManagement}>
                        Manage Account
                    </button>
                    <button class="btn btn-sm btn-outline-danger" on:click={handleLogout}>
                        Unlink Identity
                    </button>
                </div>

                {#if showMoreInfo}
                    <div class="additional-info">
                        <h5>Additional Information</h5>
                        <div class="info-row">
                            <span class="info-label">Subject ID:</span>
                            <span class="info-value">{$my_user?.auth?.keycloak?.info?.sub || 'Not available'}</span>
                        </div>

                        {#if $keycloakProfile?.firstName && $keycloakProfile?.lastName}
                            <div class="info-row">
                                <span class="info-label">Full Name:</span>
                                <span class="info-value">{$keycloakProfile.firstName} {$keycloakProfile.lastName}</span>
                            </div>
                        {/if}
                    </div>
                {/if}

                <button class="toggle-info-btn" on:click={toggleMoreInfo}>
                    {showMoreInfo ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
        {:else if hasKeycloakAuth}
            <!-- User has Keycloak association but is not currently logged in with Keycloak -->
            <div class="identity-status inactive">
                <h4>Keycloak Identity Available</h4>
                <p>You have previously linked your account with Keycloak, but you are not currently logged in.</p>

                <button class="btn btn-primary" on:click={handleLogin}>
                    Sign In with Keycloak
                </button>
            </div>
        {:else}
            <!-- No Keycloak association yet -->
            <div class="identity-status unlinked">
                <h4>Link External Identity</h4>
                <p>You can link your Koordinator account with Keycloak for enhanced security and to use your existing credentials.</p>

                <div class="benefits">
                    <h5>Benefits of linking your account:</h5>
                    <ul>
                        <li>Use your existing credentials</li>
                        <li>Enhanced account security</li>
                        <li>Simplified login process</li>
                        <li>Access to account recovery</li>
                    </ul>
                </div>

                <button class="btn btn-primary" on:click={handleLogin}>
                    Link Keycloak Identity
                </button>
            </div>
        {/if}
    {:else}
        <div class="identity-status disabled">
            <h4>Keycloak Integration Disabled</h4>
            <p>External identity integration is currently disabled in the system configuration.</p>
        </div>
    {/if}
</div>

<style>
    .keycloak-identity-manager {
        margin: 1rem 0;
        padding: 1.5rem;
        border-radius: 6px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 1.25rem;
        font-size: 1.4rem;
        color: #343a40;
    }

    h4 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        color: #495057;
    }

    h5 {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        color: #495057;
    }

    .identity-status {
        padding: 1rem;
        border-radius: 4px;
    }

    .authenticated {
        background-color: rgba(40, 167, 69, 0.1);
        border: 1px solid rgba(40, 167, 69, 0.2);
    }

    .inactive {
        background-color: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.2);
    }

    .unlinked {
        background-color: rgba(0, 123, 255, 0.1);
        border: 1px solid rgba(0, 123, 255, 0.2);
    }

    .disabled {
        background-color: rgba(108, 117, 125, 0.1);
        border: 1px solid rgba(108, 117, 125, 0.2);
    }

    .identity-info {
        margin: 1rem 0;
    }

    .info-row {
        display: flex;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }

    .info-label {
        font-weight: bold;
        min-width: 100px;
        margin-right: 0.5rem;
    }

    .info-value {
        flex: 1;
    }

    .authentication-status {
        color: #28a745;
        font-weight: bold;
    }

    .button-group {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    .additional-info {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed #ced4da;
    }

    .toggle-info-btn {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        padding: 0;
        font-size: 0.85rem;
        text-decoration: underline;
        margin-top: 0.5rem;
    }

    .toggle-info-btn:hover {
        color: #0056b3;
    }

    .benefits {
        margin: 1rem 0;
    }

    .benefits ul {
        padding-left: 1.5rem;
    }

    .benefits li {
        margin-bottom: 0.35rem;
    }
</style>
