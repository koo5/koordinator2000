<script type='js'>
	import {my_user,get_my_participation} from 'srcs/my_user.js';
	import gql from 'graphql-tag';
	import MutationForm from 'cmps/MutationForm.svelte';
	import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();

	export let campaign;
	let new_threshold = campaign.suggested_optimal_threshold;
	$: my_participation = get_my_participation(campaign, $my_user);
	$: set_new_threshold($my_user);

	function set_new_threshold(u)
	{
		if (my_participation.threshold != undefined) new_threshold = my_participation.threshold;
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

		<MutationForm  on:done={() => dispatch('my_participation_upsert')}  css_ref="cell"
			mutation={UPSERT}
			variables={upsert_vars}
		>
			<label for="threshold">My threshold:
				<input type="text" id="threshold" bind:value={new_threshold}/>
				<button type="submit">Update</button>
				(suggested: {campaign.suggested_lowest_threshold}-{campaign.suggested_highest_threshold})
			</label>
		</MutationForm>


		<MutationForm  on:done={() => dispatch('my_participation_upsert')} css_ref="cell"
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


		<MutationForm on:done={() => dispatch('my_participation_upsert')} css_ref="cell"
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
