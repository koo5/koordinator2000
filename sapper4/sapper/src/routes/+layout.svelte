<script>
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/stores';
	import { theme } from '$lib/stores';
	import Nav from '../components/Nav.svelte';
	import Notification from '$lib/components/Notification.svelte';
	
	export let data;
	
	// Handle any client-side initialization that was previously in client.js
	onMount(() => {
		// Initialize any client-side libraries or functionality here
		console.log('SvelteKit app mounted');
	});
</script>

<svelte:head>
	<!-- Add any global meta tags here -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<!-- Show loading indicator when navigating between pages -->
{#if $navigating}
	<div class="loading-indicator">
		<div class="spinner"></div>
	</div>
{/if}

<div class="app" class:dark-mode={$theme.dark}>
	<Nav {data} />

	<main>
		<slot></slot>
	</main>

	<footer>
		<p>© {new Date().getFullYear()} Koordinator</p>
	</footer>
	
	<Notification />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
		flex: 1;
	}

	footer {
		text-align: center;
		padding: 1em;
		font-size: 0.8em;
		color: #888;
	}

	.dark-mode {
		background-color: #222;
		color: #eee;
	}

	.dark-mode main {
		background-color: #333;
		color: #eee;
	}

	.loading-indicator {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background-color: #ff3e00;
		z-index: 1000;
	}

	.spinner {
		height: 100%;
		width: 100%;
		background: linear-gradient(to right, transparent, #ff3e00, transparent);
		animation: loading 1.5s infinite;
	}

	@keyframes loading {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
