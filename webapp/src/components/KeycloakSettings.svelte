<script lang="ts">
    import { my_user } from '../my_user';
    import { keycloakProfile, isAuthenticated, keycloakInstance } from '$lib/client/keycloak';
</script>

<div class="keycloak-settings">
    <h3>Keycloak Identity</h3>
    
    {#if $isAuthenticated}
        <div class="settings-section">
            <h4>Linked Identity</h4>
            <div class="identity-info">
                <div class="info-group">
                    <span class="info-label">Username:</span>
                    <span class="info-value">{$keycloakProfile?.preferred_username || 'Not available'}</span>
                </div>
                
                <div class="info-group">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{$keycloakProfile?.email || 'Not available'}</span>
                </div>
                
                <div class="info-group">
                    <span class="info-label">Name:</span>
                    <span class="info-value">
                        {#if $keycloakProfile?.firstName && $keycloakProfile?.lastName}
                            {$keycloakProfile.firstName} {$keycloakProfile.lastName}
                        {:else}
                            {$keycloakProfile?.name || 'Not available'}
                        {/if}
                    </span>
                </div>
                
                <div class="info-group">
                    <span class="info-label">Subject ID:</span>
                    <span class="info-value">{$keycloakInstance?.subject || 'Not available'}</span>
                </div>
                
                <div class="info-group">
                    <span class="info-label">Linked to app account:</span>
                    <span class="info-value">
                        {#if $my_user?.id > 0}
                            Yes (ID: {$my_user.id})
                        {:else}
                            No
                        {/if}
                    </span>
                </div>
            </div>
        </div>
    {:else}
        <p>You are not authenticated with Keycloak.</p>
    {/if}
    
    {#if $my_user.auth_debug}
        <div class="debug-section">
            <h4>Identity Debug Information</h4>
            <div class="debug-info">
                <h5>Keycloak Profile</h5>
                <pre>{JSON.stringify($keycloakProfile, null, 2) || 'No profile data'}</pre>
                
                <h5>User Object</h5>
                <pre>{JSON.stringify($my_user, null, 2) || 'No user data'}</pre>
                
                <h5>Keycloak Authentication Status</h5>
                <pre>Authenticated: {$isAuthenticated}</pre>
                <pre>Subject ID: {$keycloakInstance?.subject || 'Not available'}</pre>
                <pre>Token Expiration: {$keycloakInstance?.tokenParsed?.exp ? new Date($keycloakInstance.tokenParsed.exp * 1000).toLocaleString() : 'Not available'}</pre>
            </div>
        </div>
    {/if}
</div>

<style>
    .keycloak-settings {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .settings-section {
        margin-bottom: 1.5rem;
    }
    
    .identity-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .info-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .info-label {
        font-weight: bold;
        min-width: 120px;
    }
    
    .debug-section {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px dashed #ccc;
    }
    
    .debug-info {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
    }
    
    .debug-info h5 {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #495057;
    }
    
    .debug-info pre {
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 3px;
        font-size: 0.85rem;
        white-space: pre-wrap;
        word-break: break-all;
    }
</style>