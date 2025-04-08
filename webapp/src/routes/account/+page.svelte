<script lang="ts">
    import KeycloakIdentityManager from '../../components/KeycloakIdentityManager.svelte';
    import DeleteSelf from '../../components/DeleteSelf.svelte';
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
    
    <div class="danger-zone-section">
        <h3>Danger Zone</h3>
        <div class="danger-zone-content">
            <p>Need to delete your account? You can do that from our dedicated page.</p>
            <a href="/account/delete" class="delete-account-link">Delete Account →</a>
            <p class="help-text">
                Learn more about account deletion in our <a href="/about/help/data-deletion">data deletion guide</a>.
            </p>
        </div>
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

    .account-section, .identity-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border-radius: 6px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
    }

    .danger-zone-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border-radius: 6px;
        background-color: #f8f9fa;
        border: 1px solid #dc3545;
    }

    .danger-zone-section h3 {
        color: #dc3545;
        border-bottom: 1px solid #dc3545;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .danger-zone-content {
        margin-bottom: 0.5rem;
    }
    
    .delete-account-link {
        display: inline-block;
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #dc3545;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
    }
    
    .delete-account-link:hover {
        background-color: #c82333;
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
    
    .help-text {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #6c757d;
    }
    
    .help-text a {
        color: #dc3545;
        text-decoration: none;
    }
    
    .help-text a:hover {
        text-decoration: underline;
    }
</style>