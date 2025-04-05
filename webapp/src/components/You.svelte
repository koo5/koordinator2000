<script lang="ts">
    import { logout, my_user } from '$lib/client/my_user.ts';
    import { gql, subscribe } from '$lib/urql';

    $: my_user_id = $my_user.id;

    interface AccountData {
        accounts: Array<{ email: string }>;
    }

    /* fixme, we should rather go for users.email column */
    $: account_email_subscription = subscribe<AccountData>(
        gql`
            subscription ($my_user_id: Int) {
                accounts(where: { id: { _eq: $my_user_id } }) {
                    email
                }
            }
        `,
        {
            variables: {
                my_user_id,
            },
        }
    );

    function save(): void {
        // Placeholder for save functionality
    }
</script>

<p>
    Welcome, visitor!
    {#if $my_user.name}
        Your automatically-assigned username is "{$my_user.name}".
    {/if}
</p>

<b>Please enter your e-mail, or authenticate with google/facebook/etc</b>, otherwise, you can lose access to your account!
<br />
<h5>account</h5>
account ID: {$my_user.id}
<br />
username: {$my_user.name}
<details>
    <summary>(change..)</summary>
    <input type="text" id="title" bind:value={$my_user.name} />
    <button on:click|preventDefault={() => save()}>Save</button>
</details>
<br />
<h5>authentication</h5>
<div>
    E-mail:
    {#if $account_email_subscription.fetching}
        Loading account data...
    {:else if $account_email_subscription.data}
        {$account_email_subscription.data.accounts?.[0]?.email}
    {/if}
</div>
<br />
{#if $my_user.id > 0}
    <h5>Link your account to a social login:</h5>
    <br /><br />
    <form class="cell" on:submit={logout}>
        <button class="cell" type="submit">Log out</button>
    </form>
    <br />
{:else}
    <h5>Log in:</h5>
    <br /><br />

    <br /><br />
{/if}

<h5>messaging</h5>
<b>also, click these checkboxes to agree to receive e-mail from us:</b><br /><br />
<label><input type="checkbox" bind:checked={$my_user.check1} />receive e-mail when a campaign i participate in reaches suggested threshold</label><br />
<label><input type="checkbox" bind:checked={$my_user.check2} />receive news about my campaigns</label><br />
<label><input type="checkbox" bind:checked={$my_user.check3} />receive occasional news about Fullcracy/Koordinator.</label><br />

{#if $my_user.auth_debug}
    <h5>debug:</h5>
    <pre>
		{JSON.stringify($my_user, null, '  ')}
	</pre>
{/if}
