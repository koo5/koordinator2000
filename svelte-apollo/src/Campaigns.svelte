<script>
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe} from 'svelte-apollo';
	import Campaign from './Campaign.svelte';
	import {my_user} from './my_user';

	const CAMPAIGN_LIST = gql`
    subscription ($_user_id: Int) {
      campaigns(order_by: [{id: asc}]) {
        id,
        title,
        description,
        suggested_lowest_threshold,
        suggested_highest_threshold,
        suggested_optimal_threshold,
        participations(order_by: [{threshold: asc}]) {
          id
          threshold
          user {
            id
            name
          }
          confirmed
          condition_is_fulfilled
        },
        my_participations: participations(where: {user_id: {_eq: $_user_id}}) {
          id
          threshold
        }
      }
    }
  `;

	function maybe_subscribe(my_user)
	{
		var my_user_id;
		if (my_user)
			my_user_id = my_user.id
		else
			my_user_id = 0;
		return subscribe(client, {
				query: CAMPAIGN_LIST,
				variables: {
					_user_id: my_user_id
				}
			}
		)
	}

	$: campaigns = maybe_subscribe($my_user);

</script>

<ul>
	{#await $campaigns}
		<li>Loading...</li>
	{:then result}
		{#each result.data.campaigns as campaign (campaign.id)}
			<Campaign {campaign}/>
		{:else}
			<li>No campaigns found</li>
		{/each}
	{:catch error}
		<li>Error loading campaigns:
			<pre>{JSON.stringify(error, null, '  ')}</pre>
		</li>
	{/await}
</ul>

