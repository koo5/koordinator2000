<script lang="ts">
    import { gql, subscribe } from '$lib/urql';

    interface AccountData {
        accounts: Array<{
            id: number;
            name: string;
            email: string;
        }>;
    }

    export let user_id: number;

    $: account_subscription = subscribe<AccountData>(
        gql`
            subscription ($user_id: Int!) {
                accounts(where: { id: { _eq: $user_id } }) {
                    id
                    name
                    email
                }
            }
        `,
        {
            variables: {
                user_id,
            },
        }
    );
</script>

<h5>account</h5>
<div class="content_block">
    account ID: {user_id}
    <br />
    {#if $account_subscription.fetching}
        Loading account data...
    {:else if $account_subscription.data}
        Name: {$account_subscription.data.accounts[0]?.name || 'Unknown'}
        <br />
        e-mail: {$account_subscription.data.accounts[0]?.email || 'No email'}
    {/if}
</div>
