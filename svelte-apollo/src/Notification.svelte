<script>
  import gql from 'graphql-tag';
  import { client } from './apollo';
	import {subscribe, mutate} from 'svelte-apollo';

  export let notification;
/*
	async function update()
	{
		try
		{
			await mutate(client, {
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

notification-unread {
	background-color: yellow;
}
.notification-unread {
	background-color: yellow;
}

</style>



<li>campaign:{notification.campaign.title}</li>

<span class="{notification.read ? 'notification-read' : 'notification-unread'}">{notification.content}</span>

<label for="confirmed">
	{#if notification.confirmed}confirmed:{:else}confirm:{/if}
</label>

<input id="confirmed" type="checkbox" bind:checked={notification.confirmed}>


