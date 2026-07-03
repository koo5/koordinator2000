<script>
    import Notification from '../../components/Notification.svelte';
    import SubscribedItemsInner from '../../components/SubscribedItemsInner.svelte';
    import { getContextClient, gql, subscribe } from '$lib/urql.ts';
    import { my_user } from '$lib/client/my_user.ts';

    $: my_user_id = $my_user.id;

    $: items = subscribe(
        gql`
            subscription MySubscription222($_user_id: Int) {
                campaign_notifications(where: { account_id: { _eq: $_user_id } }, order_by: [{ id: desc }]) {
                    campaign {
                        id
                        title
                    }

                    content
                    id
                    read
                    ts
                }
            }
        `,
        {
            variables: {
                _user_id: my_user_id,
            },
        },
        true
    );

    const client = getContextClient();

    const MARK_ALL_READ = gql`
        mutation MarkAllRead($_user_id: Int!) {
            update_campaign_notifications(where: { account_id: { _eq: $_user_id }, read: { _eq: false } }, _set: { read: true }) {
                affected_rows
            }
        }
    `;

    async function mark_all_read() {
        try {
            await client.mutation(MARK_ALL_READ, { _user_id: my_user_id }).toPromise();
        } catch (e) {
            console.error('Error marking all notifications read:', e);
        }
    }
</script>

<svelte:head>
    <title>Notifications - Koordinator</title>
</svelte:head>

<div class="content_block">
    <div class="flex items-center justify-between mb-3">
        <h2 class="m-0">Notifications</h2>
        <button class="btn btn-sm" on:click={mark_all_read}>Mark all read</button>
    </div>

    <ul class="p-0 m-0 list-none">
        <SubscribedItemsInner {items} let:da={data}>
            {#each data.campaign_notifications as notification (notification.id)}
                <Notification {notification} />
            {:else}
                <li>No notifications yet. They arrive when a campaign crosses one of your thresholds.</li>
            {/each}
        </SubscribedItemsInner>
    </ul>
</div>
