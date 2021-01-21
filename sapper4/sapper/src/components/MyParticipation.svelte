<script type='js'>
	import {my_user} from 'srcs/my_user.js';
	import gql from 'graphql-tag';
	import MutationForm from 'cmps/MutationForm.svelte';

	export let campaign;
	let new_threshold = campaign.suggested_optimal_threshold;
	$: my_participation = get_my_participation(campaign, $my_user);

	function get_my_participation(campaign, my_user)
	{
		my_user=my_user
		if (!campaign)
			return {}
		if (!campaign.my_participations)
			return {}
		if (campaign.my_participations.length == 1)
		{
			let p = campaign.my_participations[0]
			new_threshold = p.threshold;
			return p
		}
		else if (campaign.my_participations.length == 0)
			return {}
		else
		{
			console.log(campaign.my_participations)
			throw('this shouldnt happen: (campaign.my_participations.length > 1)');
		}
	}

	const UPSERT = gql`
				mutation MyMutation($campaign_id: Int, $user_id: Int, $threshold: Int) {
				  insert_participations(objects: {campaign_id: $campaign_id, user_id: $user_id, threshold: $threshold}, on_conflict: {constraint: participations_campaign_id_user_id, update_columns: threshold}) {
					affected_rows
				  }
				}
			`;

	$: upsert_vars = {
				campaign_id: campaign.id,
				user_id: $my_user.id,
				threshold: new_threshold
			};


</script>

<style>
	:global(.line) {
		display: table
	}
	:global([ref=cell]) {
		display: table-cell
	}
</style>

<div class="line">
	{#if my_participation.id}

		<MutationForm css_ref="cell"
			mutation={UPSERT}
			variables={upsert_vars}
		>
			<label for="threshold">My threshold:
				<input type="text" id="threshold" bind:value={new_threshold}/>
				<button type="submit">Update</button>
				(suggested: {campaign.suggested_lowest_threshold}-{campaign.suggested_highest_threshold})
			</label>
		</MutationForm>


		<MutationForm css_ref="cell"
			mutation={gql`
					mutation MyMutation($id: Int!) {
						delete_participations_by_pk(id: $id)
						{
							id
						}
					}`}
			variables={{
				id: my_participation.id,
			}}
		>
			<button type="submit">Delete</button>
		</MutationForm>


	{:else}


		<MutationForm css_ref="cell"
			mutation={UPSERT}
			variables={upsert_vars}
		>
			<label for="threshold">My threshold:
				<input type="text" id="threshold" bind:value={new_threshold}/>
				<button type="submit">Participate</button>
				(suggested: {campaign.suggested_lowest_threshold}-{campaign.suggested_highest_threshold})
			</label>
		</MutationForm>


	{/if}
</div>
