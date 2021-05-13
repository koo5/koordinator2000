<script type='js'>

	import {
		Button,
		Card
	} from 'sveltestrap';
	import {subscribe, gql} from "src/apollo.js";
	import {query} from 'svelte-apollo';
	import {my_user} from 'src/my_user.js';
	import CampaignList from 'src/components/CampaignList.svelte';
	import * as animateScroll from 'svelte-scrollto';


	const CAMPAIGN_LIST = gql`
		query ($_user_id: Int, $_seen_ids: [Int!]) {
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
		campaigns?.forEach((x) => {result.push(x.id)});
		return result;
	}

	function more()
	{
		animateScroll.scrollTo({delay: 0, element: items_div});
		seen = seen.concat(seeing);
		more_button.blur();
	}

	let vars = {
		_user_id: my_user_id,
		_seen_ids: seen,
	}
	$: vars = {
		_user_id: my_user_id,
		_seen_ids: seen,
	}

	const items = query(
		CAMPAIGN_LIST,
		{
			variables: vars
		}
	);
	$: items?.refetch(vars);


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
	<br>
	seen:{JSON.stringify(seen, null, '')}:
	<br>
	seeing:{JSON.stringify(seeing, null, '')}:
	<br>


<div bind:this={items_div}>

<CampaignList ids={seeing}/>

</div>

</div>

<center>
	<button  class="btn btn-primary"  bind:this={more_button} color="secondary" aria-label="more..." on:click={more}>more...</button>

	<!-- https://github.com/bestguy/sveltestrap/issues/275
	<Button use:xxx color="secondary" on:click={more}>more...</Button>
	<Button bind:this={more_button} color="secondary" on:click={more}>more...</Button>
	-->

</center>
<br/>
<br/>

