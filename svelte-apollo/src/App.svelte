<script>
	import ApolloClient from 'apollo-client';
	import { client } from './apollo';
	import { setClient } from 'svelte-apollo';

	import Users from './Users.svelte';
	import AddUser from './AddUser.svelte';

	import Campaigns from './Campaigns.svelte';

	setClient(client);
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<section>
	<h2>Campaigns</h2>
	<Campaigns />
	<h2>Users</h2>
	<Users />
	<AddUser />
</section>
