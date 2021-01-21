<script type='js'>

	import MutationForm from 'cmps/MutationForm.svelte';
	import { gql } from "srcs/apollo.js";

	export let notification;
	$: confirmed = my_participation ? my_participation.confirmed : undefined;
	$: notification_id = my_participation ? my_participation.id : undefined;
	$: my_participation = my_participations ? my_participations[0] : undefined;
	$: my_participations = campaign ? campaign.my_participations : undefined;
	$: campaign = notification ? notification.campaign : undefined;

	async function del()
	{

	}


</script>

<style>

    .notification-unread {
        background-color: yellow;
    }

</style>


<li><b>{notification.campaign.title}</b></li>

<span class="{notification.read ? 'notification-read' : 'notification-unread'}">{notification.content}</span>


	<MutationForm
			mutation={gql`
				mutation MyMutation($id: Int!, $confirmed: Boolean = false) {
				  update_participations_by_pk(pk_columns: {id: $id}, _set: {confirmed: $confirmed}) {
				  	threshold
				  }
				}
			`}
			variables={{
				confirmed: confirmed,
				id: notification_id
			}}
	>
		<label for="confirmed-checbox">
			{#if notification.confirmed}
				confirmed:
			{:else}
				confirm:
			{/if}
		</label>

		<input id="confirmed-checbox" type="checkbox" bind:checked={confirmed}>
		<button type="submit">save</button>
	</MutationForm>


