<script>
	import Campaigns from "../components/CampaignsSearch.svelte";
	import { my_user } from '../my_user.js';
	import { addNotification } from '$lib/stores';
	
	function showWelcomeNotification() {
		addNotification('Welcome to Koordinator!', 'success');
	}
</script>

<svelte:head>
	<title>Koordinator</title>
</svelte:head>

<h1>Welcome to Fullcracy.</h1>
<div class="content_block">
	<p>
		Welcome, visitor!
		{#if $my_user.name}
			Your automatically-assigned username is "{$my_user.name}".
		{/if}
	</p>
	<button on:click={showWelcomeNotification}>
		Show Welcome Notification
	</button>
</div>
<h2>Where am I?</h2>
<div class="content_block">
	<p>This is a preview of Koordinator. It's like kickstarter, but not for collecting money, it's for doing things.</p>
	<p>On Kickstarter, people support campaigns by pledging money. If enough money is pledged, the campaign author can
		collect them. Here, you pledge your participation in campaigns, and you choose how many people is enough. For
		example, you would not boycott a supermarket chain all alone. Here you can create a campaign and suggest a
		threshold number. Maybe 50000 people? That should make a dent in their profits, if everyone starts at once and
		keeps at it...</p>
</div>
<h2>It looks broken..</h2>
<div class="content_block">
	<p>Koordinator is a <a href="https://github.com/koo5/koordinator2000/">work in progress</a>. You can click around,
		view campaigns,
		participate, see and confirm notifications, you can swipe left to dismimss and right to participate.. The basic
		logic is implemented, but mostly it is still just a demo with some fake buttons and no authentication.
		Come talk to us on <a href="https://webchat.freenode.net/#koordinator">IRC</a> and <a
				href="https://discord.gg/QP9mhdEk">discord</a>.
	</p>
</div>

<h1>Campaigns:</h1>
<Campaigns/>

<style>
	button {
		background-color: #ff3e00;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-weight: bold;
		cursor: pointer;
		margin-top: 1rem;
	}

	button:hover {
		background-color: #ff6340;
	}
</style>
