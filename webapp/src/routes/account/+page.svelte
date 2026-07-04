<script lang="ts">
    import { t } from '$lib/i18n';
    import DeleteSelf from '../../components/DeleteSelf.svelte';
    import AccountIdentities from '../../components/AccountIdentities.svelte';
    import { my_user } from '$lib/client/my_user.ts';
</script>

<div class="account-container">
    <h2>{$t('account.title')}</h2>
    
    <div class="account-section">
        <h3>{$t('account.your')}</h3>
        <div class="account-info">
            <div class="info-row">
                <span class="info-label">{$t('account.username')}</span>
                <span class="info-value">{$my_user.name || $t('account.not_set')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">{$t('account.id')}</span>
                <span class="info-value">{$my_user.id}</span>
            </div>
        </div>
    </div>

    <AccountIdentities />

    <div class="danger-zone-section">
        <h3>{$t('account.danger')}</h3>
        <div class="danger-zone-content">
            <p>{$t('account.delete_info')}</p>
            <a href="/account/delete" class="delete-account-link">{$t('account.delete_link')}</a>
            <p class="help-text">
                {$t('account.delete_help')} <a href="/about/help/data-deletion">{$t('account.delete_guide')}</a>.
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

    .account-section {
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