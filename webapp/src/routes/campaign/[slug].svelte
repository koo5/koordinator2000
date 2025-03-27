<script context="module">
  import _ from 'underscore';

  export async function preload(page)
  {
    const {slug} = page.params;
    if (parseInt(slug) >= 0)
    {
      const campaign_id = slug;
      console.log(campaign_id);
      return {campaign_id};
    }
  }
</script>

<script>


  import Campaign from '../../components/Campaign.svelte';
  import {my_user} from '../../my_user.js';
  import {CAMPAIGN_FRAGMENT} from '../../stuff.js';
  import {subscribe, gql} from "$lib/apollo.js";

  export let campaign_id;

  $: my_user_id = $my_user.id
  $: items = subscribe(
    gql`
    subscription ($_user_id: Int!, $campaign_id: Int!) {
      campaigns_by_pk(id: $campaign_id)
      ${CAMPAIGN_FRAGMENT}
    }
      `,
    {
      variables: {
        _user_id: my_user_id,
        campaign_id
      }
    }
  );

  //$: console.log(campaign_id);
  $: dddd = $items.data;
  $: campaign = dddd ? dddd.campaigns_by_pk : undefined;

</script>

<svelte:head>
  <title>{campaign?.title} - Koordinator</title>
</svelte:head>

<div class="content_block">

  {#if campaign}
      <Campaign is_detail_view={true} {campaign} on:my_participation_upsert={() => alert("yeeeeeehaaaaaaa")}/>
  {:else}
    {#if dddd}
      sorry, this campaign doesn't exist
    {:else}
      <div class="animate-flicker">Loading...</div>
    {/if}
  {/if}

  <br>
  <hr>
  <a href="/campaigns">more campaigns</a>

</div>


