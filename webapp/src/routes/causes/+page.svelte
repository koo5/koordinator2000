<script>
    import SubscribedItemsInner from '../../components/SubscribedItemsInner.svelte';
    import { gql, subscribe } from '$lib/urql.ts';
    import CampaignLink from '../../components/CampaignLink.svelte';

    $: items = subscribe(
        gql`
            subscription {
                causes(order_by: [{ id: asc }]) {
                    id
                    title
                    description
                    campaigns {
                        title
                        id
                    }
                }
            }
        `,
        {}
    );
</script>

Multiple campaigns can be grouped under one cause.
<div class="content_block">
    <ul>
        <SubscribedItemsInner {items} let:da={data}>
            {#each data.causes as cause (cause.id)}
                <li><h4>{cause.id} - {cause.title}</h4></li>
                <pre>{cause.description}</pre>
                {#each cause.campaigns as campaign (campaign.id)}
                    <CampaignLink {campaign} />
                {/each}
            {:else}
                <li>No causes found</li>
            {/each}
        </SubscribedItemsInner>
    </ul>
</div>
