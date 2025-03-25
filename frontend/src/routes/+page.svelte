<script>
	import Campaigns from "../components/CampaignsSearch.svelte";
	import { my_user } from '../my_user.js';
	import { debug, addNotification } from '$lib/stores';

</script>

<svelte:head>
	<title>Koordinator</title>
</svelte:head>

<div class="content_block">
	<p>
		Welcome, visitor!
		{#if $my_user.name}
			Your automatically-assigned username is "{$my_user.name}".
		{/if}
	</p>
</div>
<Campaigns/>

<style>
	.content_block {
		margin: 0rem;
		padding: 0rem;
	}
</style>
