<script lang="ts">
    import { t } from '$lib/i18n';
    import { logout, my_user } from '$lib/client/my_user.ts';
    import { gql, subscriptionStoreAsUser } from '$lib/urql';

    $: my_user_id = $my_user.id;

    interface AccountData {
        accounts: Array<{ email: string }>;
    }

    /* fixme, we should rather go for users.email column */
    $: account_email_subscription = subscriptionStoreAsUser<AccountData>({
        query: gql`
            subscription ($my_user_id: Int) {
                accounts(where: { id: { _eq: $my_user_id } }) {
                    email
                }
            }
        `,
        variables: {
            my_user_id,
        }
    });

    function save(): void {
        // Placeholder for save functionality
    }
</script>

<p>
    {$t('you.welcome')}
    {#if $my_user.name}
        {$t('you.assigned_username', { name: $my_user.name })}
    {/if}
</p>

<b>{$t('you.enter_email')}</b>
<br />
<h5>{$t('you.account')}</h5>
{$t('account.id')} {$my_user.id}
<br />
{$t('you.username')}: {$my_user.name}
<details>
    <summary>{$t('you.change')}</summary>
    <input type="text" id="title" bind:value={$my_user.name} />
    <button on:click|preventDefault={() => save()}>{$t('you.save')}</button>
</details>
<br />
<h5>{$t('you.authentication')}</h5>
<div>
    E-mail:
    {#if $account_email_subscription.fetching}
        {$t('you.loading_account')}
    {:else if $account_email_subscription.data}
        {$account_email_subscription.data.accounts?.[0]?.email}
    {/if}
</div>
<br />
{#if $my_user.id > 0}
    <h5>{$t('you.link_social')}</h5>
    <br /><br />
    <form class="cell" on:submit={logout}>
        <button class="cell" type="submit">{$t('nav.logout')}</button>
    </form>
    <br />
{:else}
    <h5>{$t('you.login')}</h5>
    <br /><br />

    <br /><br />
{/if}

<h5>{$t('you.messaging')}</h5>
<b>{$t('you.email_optin')}</b><br /><br />
<label><input type="checkbox" bind:checked={$my_user.check1} />{$t('you.optin1')}</label><br />
<label><input type="checkbox" bind:checked={$my_user.check2} />{$t('you.optin2')}</label><br />
<label><input type="checkbox" bind:checked={$my_user.check3} />{$t('you.optin3')}</label><br />

{#if $my_user.auth_debug}
    <h5>debug:</h5>
    <pre>
		{JSON.stringify($my_user, null, '  ')}
	</pre>
{/if}
