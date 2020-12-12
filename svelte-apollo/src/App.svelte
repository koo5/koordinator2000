<script>
	import ApolloClient from 'apollo-client';
	import { client } from './apollo';
	import { setClient } from 'svelte-apollo';
	import { my_user } from './my_user';

	import Users from './Users.svelte';
	import AddUser from './AddUser.svelte';

	import Campaigns from './Campaigns.svelte';

	setClient(client);
</script>

<style>
	h2 {
		color: purple;
	}
</style>

<section>
	my_user.id = {$my_user.id}.
	<hr>
	<h2>Campaigns</h2>
	<Campaigns />
	<h2>Users</h2>
	<Users />
	<AddUser />
	<hr>
	Thanks for you attention! Created by koo &amp; aindilis, 2020
</section>
