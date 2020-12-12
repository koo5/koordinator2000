<script>
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe} from 'svelte-apollo';
	import {my_user} from './my_user.js';

	export let campaign;

	const Q = gql`
    subscription {
	  participations(where: {campaign_id: {_eq: $campaign_id}, user_id: {_eq: $user_id}}) {
	  	id
		threshold
	  }
    }
  `;

	let participations = subscribe(
		client,
		{
			query: Q,
			variables: {
				campaign_id: $campaign.id,
				user_id: $my_user.id
			}
		}
	)




	//	let my_user_id = 0;
	/*const unsubscribe = */
	/*my_user.subscribe(_my_user =>
	{
		my_user_id = _my_user.id;
		update();
	});
	function update()
	{
	}*/



</script>

{#await $participations}
	<li>Loading...</li>
{:then result}
	{#each result.data.participations as participation (participation.id)}
		{participation.threshold}!
	{:else}
		<li>oooo</li>
	{/each}
{:catch error}
	<li>Error loading: {error}</li>
{/await}
