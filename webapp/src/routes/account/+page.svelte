<script lang="ts">
    import KeycloakIdentityManager from '../../components/KeycloakIdentityManager.svelte';
    import { my_user } from '$lib/client/my_user.ts';
</script>

<div class="account-container">
    <h2>Account Management</h2>
    
    <div class="account-section">
        <h3>Your Account</h3>
        <div class="account-info">
            <div class="info-row">
                <span class="info-label">Username:</span>
                <span class="info-value">{$my_user.name || 'Not set'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Account ID:</span>
                <span class="info-value">{$my_user.id}</span>
            </div>
        </div>
    </div>

    <div class="identity-section">
        <KeycloakIdentityManager />
    </div>
</div>

<style>
    .account-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    h2 {
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #dee2e6;
    }

    .account-section {
        margin-bottom: 2rem;
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

    .account-info {
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
</style>