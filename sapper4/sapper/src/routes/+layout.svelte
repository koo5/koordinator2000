<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Nav from '../components/Nav.svelte';
	
	export let data;
</script>

<Nav {data} />

<main>
	<slot></slot>
</main>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
