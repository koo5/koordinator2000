<script>
	import {my_user} from './my_user.js';
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe, mutate} from 'svelte-apollo';
	  import { onMount } from 'svelte';

	export let campaign;
	let new_threshold = campaign.suggested_optimal_threshold;

	$: my_participation = get_my_participation(campaign, $my_user);

	function get_my_participation(campaign, my_user)
	{
		if (campaign.my_participations.length == 1)
		{
			let p = campaign.my_participations[0]
			new_threshold = p.threshold;
			return p
		}
		else if (campaign.my_participations.length == 0)
			return {}
		else
			throw('(campaign.my_participations.length > 1)');
	}

	async function upsert()
	{
		try
		{
			await mutate(client, {
				mutation: gql`
					mutation MyMutation($campaign_id: Int, $user_id: Int, $threshold: Int) {
					  insert_participations(objects: {campaign_id: $campaign_id, user_id: $user_id, threshold: $threshold}, on_conflict: {constraint: participations_campaign_id_user_id, update_columns: threshold}) {
						affected_rows
					  }
					}
				`,
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

	async function del(my_participation)
	{
		try
		{
			await mutate(client, {
				mutation: gql`
					mutation MyMutation($id: Int!) {
						delete_participations_by_pk(id: $id)
						{
							id
						}
					}
				`,
				variables: {
					id: my_participation.id,
				}
			})
		} catch (e)
		{
			console.log(e)
		}
	}

</script>

<style>
	.line {
		display: table
	}
	.cell {
		display: table-cell
	}
</style>

<div class="line">
	{#if my_participation.id}
		<form class="cell" on:submit|preventDefault={upsert}>
			<label for="threshold">My threshold:
				<input type="text" id="threshold" bind:value={new_threshold}/>
				<button type="submit">Update</button>
				(suggested: {campaign.suggested_lowest_threshold}-{campaign.suggested_highest_threshold})
			</label>
		</form>
		<form class="cell"  on:submit|preventDefault={() => del(my_participation)}>
			<button type="submit">Delete</button>
		</form>
	{:else}
		<form class="cell"  on:submit|preventDefault={upsert}>
			<label for="threshold">My threshold:
				<input type="text" id="threshold" bind:value={new_threshold}/>
				<button type="submit">Participate</button>
				(suggested: {campaign.suggested_lowest_threshold}-{campaign.suggested_highest_threshold})
			</label>
		</form>
	{/if}
</div>
