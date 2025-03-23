<script>
	import Notification from '../../components/Notification.svelte';
	import SubscribedItemsInner from '../../components/SubscribedItemsInner.svelte';
	import {subscribe, gql} from "../../apollo.js";
	import {my_user} from '../../my_user.js';
	$: my_user_id = $my_user.id

	$: items = subscribe(
		gql`
			subscription MySubscription222($_user_id: Int) {
			  campaign_notifications(where: {account_id: {_eq: $_user_id}}, order_by: [{id: desc}]) {
				campaign {
				  id
				  title
                  my_participations: participations(where: {account_id: {_eq: $_user_id}}) {
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
				_user_id: my_user_id
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

