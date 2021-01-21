<script type='js'>

	import MutationForm from 'cmps/MutationForm.svelte';
	import { gql } from "srcs/apollo.js";

	export let notification;

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
				confirmed: notification.campaign.my_participations[0].confirmed,
				id: notification.campaign.my_participations[0].id
			}}
	>
		<label for="confirmed-checbox">
			{#if notification.confirmed}
				confirmed:
			{:else}
				confirm:
			{/if}
		</label>

		<input id="confirmed-checbox" type="checkbox" bind:checked={notification.campaign.my_participations[0].confirmed}>
		<button type="submit">save</button>
	</MutationForm>


