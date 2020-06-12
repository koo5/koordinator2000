<script context="module">
	export function preload({ params, query }) {
		return this.fetch(`campaigns.json`).then(r => r.json()).then(campaigns => {
			return { campaigns };
		});
	}
</script>

<script>
	import Campaing_listing_item from "./Campaing_listing_item.svelte";
	export let campaigns;
</script>

<style>
	ul {
		margin: 0 0 1em 0;
		line-height: 1.5;
	}
</style>

<svelte:head>
	<title>All Campaigns</title>
</svelte:head>

<ul>
	{#each campaigns as campaign}
        <Campaing_listing_item {campaign}/>
		<hr/>
	{/each}
</ul>
