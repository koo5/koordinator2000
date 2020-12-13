<script>
	import {my_user} from './my_user.js';
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe, mutate} from 'svelte-apollo';

	export let campaign;

	$: my_participation = get_my_participation(campaign, $my_user);

	function get_my_participation(campaign, my_user)
	{
		if (campaign.my_participations.length == 1)
			return campaign.my_participations[0]
		else if (campaign.my_participations.length == 0)
			return ({
				threshold: 66
			})
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
					threshold: my_participation.threshold
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
				<input type="text" id="threshold" bind:value={my_participation.threshold}/>
				<button type="submit">Update</button>
				(suggested: 20-50000)
			</label>
		</form>
		<form class="cell"  on:submit|preventDefault={del}>
			<button type="submit">Delete</button>
		</form>
	{:else}
		<form class="cell"  on:submit|preventDefault={upsert}>
			<label for="threshold">My threshold:
				<input type="text" id="threshold" bind:value={my_participation.threshold}/>
				<button type="submit">Participate</button>
				(suggested: 20-50000)
			</label>
		</form>
	{/if}
</div>
