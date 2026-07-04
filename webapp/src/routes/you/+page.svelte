<script lang="ts">
    import { t } from '$lib/i18n';
    import { goto } from '$app/navigation';
    import { logout, my_user } from '$lib/client/my_user.ts';

    async function do_logout(): Promise<void> {
        await logout();
        goto('/');
    }
</script>

<svelte:head>
    <title>{$t('you.title')} - Koordinator</title>
</svelte:head>

<div class="profile-container">
    <h1>{$t('you.title')}</h1>

    {#if $my_user.id > 0}
        <div class="profile-card">
            <div class="profile-header">
                <div class="avatar">
                    {($my_user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <h2>{$my_user.name}</h2>
            </div>

            <div class="profile-details">
                <div class="detail-item">
                    <span class="label">{$t('you.user_id')}</span>
                    <span class="value">{$my_user.id}</span>
                </div>
                {#if $my_user.email}
                    <div class="detail-item">
                        <span class="label">{$t('you.email')}</span>
                        <span class="value">{$my_user.email}</span>
                    </div>
                {/if}
            </div>

            <div class="actions">
                <a class="btn btn-primary btn-sm" href="/login">{$t('nav.verify_identity')}</a>
                <a class="btn btn-ghost btn-sm" href="/account">{$t('nav.account')}</a>
                <button class="btn btn-ghost btn-sm text-error" on:click={do_logout}>{$t('nav.logout')}</button>
            </div>
        </div>
    {:else}
        <p class="text-center opacity-60">{$t('you.loading')}</p>
    {/if}
</div>

<style>
    .profile-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    h1 {
        margin-bottom: 2rem;
        text-align: center;
    }

    .profile-card {
        background-color: var(--color-base-100);
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        overflow: hidden;
    }

    .profile-header {
        background-color: var(--color-primary);
        color: var(--color-primary-content);
        padding: 2rem;
        text-align: center;
    }

    .avatar {
        width: 80px;
        height: 80px;
        background-color: var(--color-base-100);
        color: var(--color-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        margin: 0 auto 1rem;
    }

    h2 {
        margin: 0;
        font-size: 1.5rem;
    }

    .profile-details {
        padding: 1.5rem 2rem;
    }

    .detail-item {
        display: flex;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--color-base-200);
    }

    .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .label {
        font-weight: bold;
        width: 110px;
        color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
    }

    .actions {
        display: flex;
        gap: 0.5rem;
        padding: 0 2rem 1.5rem;
        flex-wrap: wrap;
    }
</style>
