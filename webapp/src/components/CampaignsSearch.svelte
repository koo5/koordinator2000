<script>
	import {
		Button,
		Card
	} from './ui';
	import { gql, queryStore, getContextClient } from '$lib/urql.ts';
	import {my_user} from '../my_user.ts';
	import CampaignList from './CampaignList.svelte';
	import * as animateScroll from 'svelte-scrollto';
	import { browser } from '$app/environment';
	import { debug } from '$lib/stores';


	const CAMPAIGN_LIST = gql`
		query CampaignList($_user_id: Int, $_seen_ids: [Int!]) {
			campaigns(
				order_by: [{id: asc}],
				limit: 5,
				where: {
					_and:
					{
						smazano: {_eq: false},
						stealth: {_eq: false},
						_not: {campaign_dismissals: {account_id: {_eq: $_user_id}}},
						id: {_nin: $_seen_ids}
					}
				}
			)
			{
				id
			}
		}
  	`;

	$: my_user_id = $my_user.id

	let seen = [];
	$: seeing = get_seeing($items?.data?.campaigns);

	function get_seeing(campaigns)
	{
		let result = []
		campaigns?.forEach((x) =>
		{
			result.push(x.id)
		});
		return result;
	}

	function more()
	{
		if (browser) {
			animateScroll.scrollTo({delay: 0, element: items_div});
			more_button?.blur();
		}
		seen = seen.concat(seeing);
	}

	let vars = {
		_user_id: my_user_id,
		_seen_ids: seen,
	}
	$: vars = {
		_user_id: my_user_id,
		_seen_ids: seen,
	}

	// Use queryStore directly for more reliable handling
	$: items = queryStore({
		client: getContextClient(),
		query: CAMPAIGN_LIST,
		variables: vars,
		pause: !browser
	});


	let more_button;

	function xxx(x)
	{
		console.log(x);
	}

	let items_div;

</script>
<div class="content_block">

	categories:
	[all] [ecology] [human rights] [animal rights] [commerce & products] [tech] [politics]
	<br>
	items on page:
	[5] [15] [50] [500]
	<br>
	sort by:
	[id]
	[title]
	[proximity]
	[number of participants]

	{#if $debug}

	<br>
	seen:{JSON.stringify(seen, null, '')}:
	<br>
	seeing:{JSON.stringify(seeing, null, '')}:
	<br>
	{/if}

</div>

<div bind:this={items_div}>

	<CampaignList ids={seeing}/>

</div>

<center>
	<button class="btn btn-primary" bind:this={more_button} color="secondary" aria-label="more..." on:click={more}>
		more...
	</button>

	<!-- Use our custom Button component instead
	<Button bind:this={more_button} color="secondary" on:click={more}>more...</Button>
	-->

</center>
<br/>
<br/>

