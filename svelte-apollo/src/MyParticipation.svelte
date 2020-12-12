<script>
	import {my_user} from './my_user.js';
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe, mutate} from 'svelte-apollo';

	const upsert_mutation = gql`
		mutation MyMutation($campaign_id: Int, $user_id: Int, $threshold: Int) {
		  insert_participations(objects: {campaign_id: $campaign_id, user_id: $user_id, threshold: $threshold}, on_conflict: {constraint: participations_campaign_id_user_id, update_columns: threshold}) {
			affected_rows
		  }
		}
	`;

	export let campaign;
	let threshold = 50;

	async function upsert()
	{
		try
		{
			await mutate(client, {
				mutation: upsert_mutation,
				variables: {
					campaign_id: campaign.id,
					user_id: $my_user.id,
					threshold: threshold
				}
			})
		} catch (e)
		{
			console.log(e)
		}
	}

	async function del()
	{

	}

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


	//
	//participations(order_by: [{id: asc}]) {
	const Q = gql`
    subscription MyQuery($campaign_id: Int, $user_id: Int) {
	  participations(where: {campaign_id: {_eq: $campaign_id}, user_id: {_eq: $user_id}}) {
	  	id
		threshold
	  }
    }
  `;

	$: participations = subscribe(
		client,
		{
			query: Q,
			variables: {
				campaign_id: campaign.id,
				user_id: $my_user.id
			}
		}
	)


</script>

<div>
	{#await $participations}
		Loading...
	{:then result}
		{#each result.data.participations as participation (participation.id)}
			my threshold is {participation.threshold}!

			<form on:submit|preventDefault={upsert}>
			  <label for="threshold">My threshold:</label>
			  <input type="text" id="threshold" bind:value={threshold} />
			  <button type="submit">Update</button>
			  (suggested: 20-50000)
			</form>


			<form on:submit|preventDefault={del}>
			<button type="submit">Delete</button>
			</form>

		{:else}
			<form on:submit|preventDefault={upsert}>
			  <label for="threshold">My threshold:</label>
			  <input type="text" id="threshold" bind:value={threshold} />
			  <button type="submit">Participate</button>
			  (suggested: 20-50000)
			</form>

		{/each}
	{:catch error}
		<pre>Error loading: {JSON.stringify(error, null, '  ')}</pre>
	{/await}
</div>
