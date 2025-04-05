<script lang="ts">
    import { type Campaign as CampaignType, my_user } from '$lib/client/my_user.ts';
    import { getContextClient, gql, subscriptionStore } from '$lib/urql';
    import SubscribedItemsInner from './SubscribedItemsInner.svelte';
    import { CAMPAIGN_FRAGMENT } from '$lib/client/campaign.ts';
    import { browser } from '$app/environment';
    import type { OperationResultState } from '@urql/core';
    import CampaignsListSorted from './CampaignsListSorted.svelte';


    export let ids: number[];
    let campaigns;


    // Interface definitions
    interface CampaignQueryResult {
        campaigns: CampaignType[];
    }

    interface CampaignQueryStore extends OperationResultState<CampaignQueryResult> {
        data?: CampaignQueryResult;
    }



    // Query with ids filter
    const CAMPAIGN_LIST = gql`
		subscription ($_user_id: Int, $_ids: [Int!]) {
			campaigns(
				where: {
					id: {_in: $_ids}
				}
			)
			${CAMPAIGN_FRAGMENT}
		}
	`;

    $: campaigns_query = subscriptionStore({
        client: getContextClient(),
        query: CAMPAIGN_LIST,
        variables: {
            _user_id: my_user_id,
            _ids: ids,
        },
    });

    $: my_user_id = $my_user.id;

</script>

<!-- Import Swiper styles -->
<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
</svelte:head>

CampaignList ids={ids}

<div class="campaign-container">
    <SubscribedItemsInner items={campaigns_query} let:da={itemsData}>
        <CampaignsListSorted ids={ids} items={itemsData} />
    </SubscribedItemsInner>
</div>

<style>
    /* Container styles to prevent column overflow */
    .campaign-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100%;
    }

    :global(.campaign-container > div),
    :global(.campaign-container > div > div){
        display: block !important;
        width: 100% !important;
        grid-template-columns: 1fr !important;
        column-count: 1 !important;
        columns: 1 !important;
    }

</style>
