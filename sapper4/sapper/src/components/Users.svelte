<script type='js'>

	import {impersonate} from 'srcs/my_user.js';
	import {subscribe, gql} from "srcs/apollo.js";
	import SubscribedItemsInner from 'cmps/SubscribedItemsInner.svelte';

	const USER_LIST = gql`
    subscription {
      accounts(order_by: [{id: asc}]) {
        id,
        name,
        email
      }
    }
  `;

	$: items = subscribe(USER_LIST);


</script>

<style>

	.button {
		line-height: 1em;
		height: 1em;
	}

</style>

<ul>
	<SubscribedItemsInner {items} let:da={data}>
		{#each data.accounts as user (user.id)}
			<li>{user.id} - {user.name} - {user.email}
				<button class="button" on:click={() => impersonate(user.id)}>
					Impersonate
				</button>
			</li>
		{/each}
	</SubscribedItemsInner>
</ul>

