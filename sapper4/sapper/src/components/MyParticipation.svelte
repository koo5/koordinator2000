<script type='js'>
	import {my_user,get_my_participation} from 'srcs/my_user.js';
	import gql from 'graphql-tag';
	import MutationForm from 'cmps/MutationForm.svelte';
	import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();
	import {get_status_class,get_tickmark} from 'srcs/stuff.js';

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
	/*input
	{ width: 10em; }
	^ i guess this is relative to the "outer" font, not the font used to display the digits
	*/

</style>

	{#if my_participation.id}

		<MutationForm  on:done={() => dispatch('my_participation_upsert')}  css_ref="cell"
			mutation={UPSERT}
			variables={upsert_vars}
		>
			minimum threshold suggested: {campaign.suggested_lowest_threshold}<br>
			<label>My threshold:
				<input type="number" placeholder={campaign.suggested_optimal_threshold} maxlength="10" min="0" max="9999999999"  bind:value={new_threshold}/>
				<button type="submit">Update</button><br>
				maximum threshold suggested:{campaign.suggested_highest_threshold}
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

		<p>
		{get_tickmark(my_participation)}
		{#if my_participation.threshold != undefined}
			{#if my_participation.condition_is_fulfilled}
				{#if my_participation.confirmed}
					<span class="confirmed">My participation is confirmed.</span>
				{:else}
					<span class="condition_is_fulfilled">My threshold is reached, waiting for <a href="/notifications">confirmation.</a></span>
				{/if}
			{:else}
				<span class="condition_is_not_fulfilled">I'm waiting for more people</span>
			{/if}
		{:else}
			I'm not participating.
		{/if}
		</p>

	{:else}


		<MutationForm on:done={() => dispatch('my_participation_upsert')} css_ref="cell"
			mutation={UPSERT}
			variables={upsert_vars}
		>
			<label>My threshold:
				<input type="number"  placeholder={campaign.suggested_optimal_threshold} min="0" max="9999999999" bind:value={new_threshold}/>
			</label>
			<button type="submit">Participate</button>
			(suggested: {campaign.suggested_lowest_threshold} - {campaign.suggested_highest_threshold})
		</MutationForm>


	{/if}
