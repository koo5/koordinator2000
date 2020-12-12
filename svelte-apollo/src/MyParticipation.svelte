<script>
	import {my_user} from './my_user.js';
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe, mutate} from 'svelte-apollo';
	import { onMount } from 'svelte';

	const upsert_mutation = gql`
		mutation MyMutation($campaign_id: Int, $user_id: Int, $threshold: Int) {
		  insert_participations(objects: {campaign_id: $campaign_id, user_id: $user_id, threshold: $threshold}, on_conflict: {constraint: participations_campaign_id_user_id, update_columns: threshold}) {
			affected_rows
		  }
		}
	`;

	export let campaign;

	async function upsert()
	{
		try
		{
			await mutate(client, {
				mutation: upsert_mutation,
				variables: {
					campaign_id: campaign.id,
					user_id: $my_user.id,
					threshold: new_threshold
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

	$: participation = (participations)[0];
	$: threshold = participation&&participation.threshold;
	let new_threshold = 50;

	onMount(async () => {
		participations.subscribe((t) => {new_threshold = (participations[0]&&participations[0].threshold) || 60});
	});



</script>

<div>
	{#await $participations}
		Loading...
	{:then result}
		{#each result.data.participations as participation (participation.id)}
			my threshold is {participation.threshold}!

			<form on:submit|preventDefault={upsert}>
			  <label for="threshold">My threshold:</label>
			  <input type="text" id="threshold" bind:value={new_threshold} />
			  <button type="submit">Update</button>
			  (suggested: 20-50000)
			</form>


			<form on:submit|preventDefault={del}>
			<button type="submit">Delete</button>
			</form>

		{:else}
			<form on:submit|preventDefault={upsert}>
			  <label for="threshold">My threshold:</label>
			  <input type="text" id="threshold" bind:value={new_threshold} />
			  <button type="submit">Participate</button>
			  (suggested: 20-50000)
			</form>

		{/each}
	{:catch error}
		<pre>Error loading: {JSON.stringify(error, null, '  ')}</pre>
	{/await}
</div>
