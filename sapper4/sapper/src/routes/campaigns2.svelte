<script type='js'>

	import {
		Button,
	} from 'sveltestrap';
	import {subscribe, gql} from "src/apollo.js";
	import {query} from 'svelte-apollo';
	import {my_user} from 'src/my_user.js';
	import CampaignList from 'src/components/CampaignList.svelte';
	import {onMount, onDestroy} from "svelte";



	const CAMPAIGN_LIST = gql`
		query ($_user_id: Int, $_seen_ids: [Int!]) {
			campaigns(
				order_by: [{id: asc}],
				limit: 10,
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
	$: seeing = $items?.data?.ids || [];

	function more()
	{
		seen = seen.concat(seeing);
	}

	let vars = {_user_id: my_user_id,
				_seen_ids: seen,
	}
	$: vars = {	_user_id: my_user_id,
				_seen_ids: seen,
	}

	const items = query(
		CAMPAIGN_LIST,
		{
			variables: vars
		}
	);
	$: items?.refetch(vars);


//={[106,86 ]

</script>

categories:
[all] [ecology] [human rights] [animal rights] [commerce & products] [politics]
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


<CampaignList ids={seeing}}/>
<Button color="secondary" on:click={more}>more...</Button>
