<script lang="ts">
    import { type Campaign as CampaignType, my_user } from '$lib/client/my_user.ts';
    import { getContextClient, gql, subscriptionStore } from '$lib/urql';
    import SubscribedItemsInner from './SubscribedItemsInner.svelte';
    import { CAMPAIGN_FRAGMENT } from '$lib/client/campaign.ts';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import CampaignSwiper from './CampaignSwiper.svelte';
    import CampaignListView from './CampaignListView.svelte';
    import { debug, mobile } from '$lib/stores.ts';

    export let ids: number[];

    interface CampaignQueryResult {
        campaigns: CampaignType[];
    }

    // Subscribe to the full loaded deck so each card updates live (the id set is
    // fixed by the parent; lazy-loading grows it).
    const CAMPAIGN_LIST = gql`
		subscription ($_user_id: Int, $_ids: [Int!]) {
			campaigns(where: { id: { _in: $_ids } })
			${CAMPAIGN_FRAGMENT}
		}
	`;

    $: campaigns_query = subscriptionStore<CampaignQueryResult>({
        client: getContextClient(),
        query: CAMPAIGN_LIST,
        variables: {
            _user_id: $my_user.id || -1,
            _ids: ids,
        },
    });

    // Discovery is a swipe deck on mobile, a lazy-loaded listing on desktop.
    onMount(() => {
        if (!browser) return;
        const mq = window.matchMedia('(max-width: 768px)');
        const update = () => mobile.set(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    });
</script>

{#if $debug}CampaignList ids={ids}{/if}

<div class="campaign-container">
    <SubscribedItemsInner items={campaigns_query} let:da={itemsData}>
        {#if $mobile}
            <CampaignSwiper ids={ids} items={itemsData} on:loadmore on:my_participation_upsert />
        {:else}
            <CampaignListView ids={ids} items={itemsData} on:loadmore on:my_participation_upsert />
        {/if}
    </SubscribedItemsInner>
</div>

<style>
    .campaign-container {
        width: 100%;
        max-width: 100%;
    }
</style>
