<script>
	import Campaigns from "cmps/Campaigns.svelte";
	import {my_user} from 'srcs/my_user.js';

</script>

<style>

</style>

<svelte:head>
	<title>Koordinator</title>
</svelte:head>

<div class="content_block">
	<h1>Welcome to Koordinator.</h1>
	<p>
		Welcome, visitor!
		{#if $my_user.name}
			Your automatically-assigned username is "{$my_user.name}".
		{/if}
	</p>
	<h2>Where am i?</h2>
	<p>This is a preview of Koordinator. It's like kickstarter, but not for collecting money, it's for doing things.</p>
	<p>On Kickstarter, people support campaigns by pledging money. If enough money is pledged, the campaign author can
		collect them. Here, you pledge your participation in campaigns, and you choose how many people is enough. For
		example, you would not boycott a supermarket chain all alone. Here you can create a campaign and suggest a
		threshold number. Maybe 50000 people? That should make a dent in their profits, if everyone starts at once and
		keeps at it!</p>
	<h2>It looks broken?</h2>
	<p>Koordinator is a <a href="https://github.com/koo5/koordinator2000/">work in progress</a>. You can click around,
		view campaigns,
		participate, see and confirm notifications, you can swipe left to dismimss and right to participate.. The basic
		logic is implemented, but mostly it is still just a demo with some fake buttons and no authentication.
		Come talk to us on <a href="https://webchat.freenode.net/#koordinator">IRC</a> and <a
				href="https://discord.gg/QP9mhdEk">discord</a>.
	</p>
	<h1>Campaigns:</h1>
</div>
<Campaigns/>


