<script>
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe} from 'svelte-apollo';
	import Notification from './Notification.svelte';
	import {my_user} from './my_user';

//	      		order_by: [{id: desc}]


	const LIST = gql`
	subscription MySubscription222($_user_id: Int) {
	  campaign_notifications(where: {user_id: {_eq: $_user_id}}) {
		campaign {
		  id
		  title
		}
		confirmed
		content
		id
		read
	  }
	}
	`;


	function maybe_subscribe(my_user)
	{
		if(my_user)
		{
			return subscribe(
				client,
				{
					query: LIST,
					variables: {
						_user_id: my_user.id
					}
				}
			)
		}
		else
			return subscribe(
				client,
				{
					query: LIST,
					variables: {
						_user_id: 0
					}
				}
			)
	}

	$: notifications = maybe_subscribe($my_user);

</script>

<ul>

	{#if $notifications !== 5}
		{#await $notifications}
			<li>Loading...</li>
		{:then result}
			<pre>{JSON.stringify(result, null, '  ')}</pre>
			{#each result.data.campaign_notifications as notification (notification.id)}
				<Notification {notification}/>
			{:else}
				<li>No notifications found</li>
			{/each}
		{:catch error}
			<li>Error loading notifications:
				<pre>{JSON.stringify(error, null, '  ')}</pre>
			</li>
		{/await}
	{:else}
		Not ready..
	{/if}
</ul>

