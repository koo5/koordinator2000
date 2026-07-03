<script lang="ts">
    import { getContextClient, gql, queryStore } from '$lib/urql.ts';
    import { my_user } from '$lib/client/my_user.ts';

    const client = getContextClient();

    // The verification spokes attached to this account (the hub-and-spoke model).
    const IDENTITIES = gql`
        query MyIdentities($account_id: Int!) {
            verified_user_authentications(
                where: { account_id: { _eq: $account_id } }
                order_by: { provider: asc }
            ) {
                provider
                login_name
            }
        }
    `;

    $: identities = queryStore<{
        verified_user_authentications: Array<{ provider: string; login_name: string }>;
    }>({
        client,
        query: IDENTITIES,
        variables: { account_id: $my_user?.id || -1 },
    });

    const LABELS: Record<string, string> = { github: 'GitHub', google: 'Google', email: 'Email' };
    const ICONS: Record<string, string> = { github: '🐙', google: '🔵', email: '✉️' };
</script>

<div class="identity-section">
    <h3>Verified identities</h3>
    <p>Each verified identity adds trust to your account. You can connect more than one.</p>

    {#if $identities.fetching}
        <p>Loading…</p>
    {:else if $identities.error}
        <p class="error-text">Couldn't load your identities.</p>
    {:else if $identities.data?.verified_user_authentications?.length}
        <ul class="identity-list">
            {#each $identities.data.verified_user_authentications as v}
                <li>
                    <span class="icon">{ICONS[v.provider] || '🔗'}</span>
                    <b>{LABELS[v.provider] || v.provider}</b>
                    <span class="login-name">{v.login_name}</span>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No verified identities yet — this account is anonymous.</p>
    {/if}

    <a class="btn btn-primary btn-sm" href="/login">Add a verified identity</a>
</div>

<style>
    .identity-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border-radius: 6px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
    }
    .identity-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
    }
    .identity-list li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0;
    }
    .icon {
        font-size: 1.2rem;
    }
    .login-name {
        color: #6c757d;
        font-size: 0.9rem;
    }
    .error-text {
        color: #dc3545;
    }
</style>
