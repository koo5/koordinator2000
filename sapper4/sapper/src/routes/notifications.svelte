<script type='js'>

	import SubscribedItemsInner from 'cmps/SubscribedItemsInner.svelte';
	import {subscribe, gql} from "srcs/apollo.js";
	import Notification from 'cmps/Notification.svelte';
	import {my_user} from 'srcs/my_user.js';

	$: items = subscribe(
		gql`
			subscription MySubscription222($_user_id: Int) {
			  campaign_notifications(where: {user_id: {_eq: $_user_id}}, order_by: [{id: desc}]) {
				campaign {
				  id
				  title
                  my_participations: participations(where: {user_id: {_eq: $_user_id}}) {
                    id
                    confirmed
                  }
				}

				content
				id
				read
			  }
			}`,
		{
			variables: {
				_user_id: $my_user.id
			}
		}
	);

</script>
<div class="content_block">
<ul>
	<SubscribedItemsInner {items} let:da={data}>
		{#each data.campaign_notifications as notification (notification.id)}
			<Notification {notification}/>
		{:else}
			<li>No notifications found</li>
		{/each}
	</SubscribedItemsInner>
</ul>
</div>

<!--<pre>{JSON.stringify(items, null, 2)}</pre> -->

