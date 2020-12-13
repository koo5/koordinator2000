<script>
	import {client} from './apollo';
	import {setClient} from 'svelte-apollo';
	import {my_user} from './my_user';
	import {onMount} from 'svelte';

	import Users from './Users.svelte';
	import AddUser from './AddUser.svelte';
	import Causes from './Causes.svelte';
	import Campaigns from './Campaigns.svelte';
	import AddCampaign from './AddCampaign.svelte';
	import Notifications from './Notifications.svelte';

	setClient(client);

	onMount(() =>
	{
		my_user.update((x) =>
		{
			let result;
			console.log(x);
			if (x)
				result = x;
			else
				result = {id: 1, name: 'me', email: 'me@me.me'}
			console.log(result);
			return result
		});
	});

</script>

<style>
	h2 {
		color: purple;
	}
</style>

<section>
	my_user.id = {$my_user && $my_user.id}.
	<hr>
	<h2>Notifications</h2>
	<Notifications/>
	<hr>
	<h2>Causes</h2>
	<Causes/>
	<hr>
	<h2>Campaigns</h2>
	<Campaigns/>
	<AddCampaign/>
	<hr>
	<h2>Users</h2>
	<Users/>
	<AddUser/>
	<hr>
	<h2>Articles</h2>
	...
	<hr>
	<h2>WIP. Roadmap:</h2>
	<ul>
		<li>multiple display modes. (A default mode with lots of explanations, and a "power" mode that lets you review
			campaigns/causes and interact with maximum speed)
		</li>
		<li>real initial content. (We have good ideas and sources for campaigns, so let's fill the db with them)</li>
		<li>authentication</li>
		<li>matching</li>
		<li>e-mail notifications</li>
		<li>routing/navbar</li>
		<li>less naive db querying (caching etc)</li>
		<li>figuring out how to svelte right.</li>
	</ul>
	<hr>
	Thanks for you attention! Created by koo &amp; aindilis.
</section>
