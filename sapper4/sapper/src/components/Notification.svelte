<script type='js'>
/*  import gql from 'graphql-tag';
	import {subscribe, mutation} from 'svelte-apollo';
*/
  export let notification;
/*
	async function update()
	{
		try
		{
			await mutation(client, {
				mutation: gql`

				`,
				variables: {
					confirmed: notification.confirmed,
					read: notification.read,
					id: notification.id
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
*/
</script>

<style>

.notification-unread {
	background-color: yellow;
}

</style>



<li><b>{notification.campaign.title}</b></li>

<span class="{notification.read ? 'notification-read' : 'notification-unread'}">{notification.content}</span>

<form>
	<label for="confirmed-checbox">{#if notification.confirmed}confirmed:{:else}confirm:{/if}
		<input id="confirmed-checbox" type="checkbox" bind:checked={notification.confirmed}>
	</label>
</form>

