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


	import Campaign from 'cmps/Campaign.svelte';
	import {my_user} from 'srcs/my_user.js';
	import {CAMPAIGN_FRAGMENT} from 'srcs/stuff.js';
	import {subscribe, gql} from "srcs/apollo.js";

	export let campaign_id;


	$: items = subscribe(
		gql`
		subscription ($_user_id: Int!, $campaign_id: Int!) {
		  campaigns_by_pk(id: $campaign_id)
			${CAMPAIGN_FRAGMENT}
		}
  		`,
		{
			variables: {
				_user_id: $my_user.id,
				campaign_id
			}
		}
	);

	$: console.log(campaign_id);
	$: campaign = $items.data?.campaigns_by_pk;

</script>

<svelte:head>
	<title>{campaign?.title} - Koordinator</title>
</svelte:head>

<div class="content_block">

	{#if campaign}
			<Campaign is_detail_view={true} {campaign} on:my_participation_upsert={() => alert("yeeeeeehaaaaaaa")}/>
	{:else}
		<div class="animate-flicker">Loading...</div>
	{/if}

	<br>
	<hr>
	<a href="/campaigns">more campaigns.</a>

</div>


