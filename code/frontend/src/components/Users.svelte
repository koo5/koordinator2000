<script type='js'>

	import {impersonate} from 'src/my_user.js';
	import {subscribe, gql} from "src/apollo.js";
	import SubscribedItemsInner from 'src/components/SubscribedItemsInner.svelte';

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
			<li>{user.id} - <a href="users/{user.id}">{user.name}</a> - <details><summary>...</summary>{user.email}</details>
				<button class="button" on:click={() => impersonate(user.id)}>
					Impersonate
				</button>
			</li>
		{/each}
	</SubscribedItemsInner>
</ul>
