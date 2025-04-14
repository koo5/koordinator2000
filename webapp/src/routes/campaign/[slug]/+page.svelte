<script>
    import Campaign from '../../../components/Campaign.svelte';
    import { my_user } from '$lib/client/my_user.ts';
    import { CAMPAIGN_FRAGMENT } from '$lib/client/campaign.ts';
    import { gql, subscribe } from '$lib/urql.ts';

    export let data;
    const { campaign_id, slug } = data;

    // If we have a slug but no campaign_id, we're still waiting for lookup
    $: loading_slug = !!slug && !campaign_id;

    $: my_user_id = $my_user.id;
    $: items = campaign_id 
        ? subscribe(
            gql`
            subscription ($_user_id: Int!, $campaign_id: Int!) {
              campaigns_by_pk(id: $campaign_id)
                ${CAMPAIGN_FRAGMENT}
            }
            `,
            {
                variables: {
                    _user_id: my_user_id,
                    campaign_id,
                },
            }
        )
        : { subscribe: () => () => {} };

    $: dddd = $items.data;
    $: campaign = dddd ? dddd.campaigns_by_pk : undefined;
</script>

<svelte:head>
    <title>{campaign?.title || 'Campaign'} - Koordinator</title>
</svelte:head>

<div class="content_block">
    {#if loading_slug}
        <div class="animate-flicker">Looking up campaign by slug...</div>
    {:else if campaign}
        <Campaign is_detail_view={true} {campaign} on:my_participation_upsert={() => alert('yeeeeeehaaaaaaa')} />
    {:else if dddd}
        this campaign doesn't exist
    {:else}
        <div class="animate-flicker">Campaign is loading...</div>
    {/if}

    <br />
    <hr />
    <a href="/campaigns">more campaigns</a>
</div>
