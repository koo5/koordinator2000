<script type='js'>
	import {
		Button,
		Label,
		Input,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'sveltestrap';
	import {my_user, get_my_participation} from 'srcs/my_user.js';
	import gql from 'graphql-tag';
	import MutationForm from 'cmps/MutationForm.svelte';
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();
	import {get_status_class, get_tickmark} from 'srcs/stuff.js';

	export let campaign;
	let new_threshold = campaign.suggested_optimal_threshold;
	$: my_participation = get_my_participation(campaign, $my_user);
	$: set_new_threshold($my_user);

	function set_new_threshold(u)
	{
		if (my_participation.threshold != undefined) new_threshold = my_participation.threshold;
	}

	$: update_button_disabled = my_participation.threshold == new_threshold;

	const UPSERT = gql`
				mutation MyMutation($campaign_id: Int, $user_id: Int, $threshold: Int) {
				  insert_participations(objects: {campaign_id: $campaign_id, account_id: $user_id, threshold: $threshold}, on_conflict: {constraint: participations_campaign_id_user_id, update_columns: threshold}) {
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


</style>

minimum suggested: {campaign.suggested_lowest_threshold}<br>

{#if my_participation.id}

	<MutationForm on:done={() => dispatch('my_participation_upsert')} css_ref="inline"
				  mutation={UPSERT}
				  variables={upsert_vars}
	>

		<Label>My threshold:
			<Input type="number" placeholder={campaign.suggested_optimal_threshold} maxlength="10" min="0"
				   max="9999999999" bind:value={new_threshold}/>
		</Label>
		<Button color="success" type="submit" disabled={update_button_disabled}>Update</Button>

		<MutationForm on:done={() => dispatch('my_participation_upsert')} css_ref="inline"
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
			<Button color="secondary" class="inline" type="submit">Delete</Button>
		</MutationForm>

	</MutationForm>

{:else}


	<MutationForm on:done={() => dispatch('my_participation_upsert')} css_ref="inline"
				  mutation={UPSERT}
				  variables={upsert_vars}
	>

		<Label>My threshold:
			<Input type="number" placeholder={campaign.suggested_optimal_threshold} min="0" max="9999999999"
				   bind:value={new_threshold}/>
		</Label>
		<Button color="primary" type="submit">Participate</Button>
		<br>
	</MutationForm>


{/if}

<br>maximum suggested:{campaign.suggested_highest_threshold}


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



