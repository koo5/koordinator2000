<script>
	import { page } from '$app/stores';
	import { addNotification } from '$lib/stores';
	
	function showWelcomeNotification() {
		addNotification('Welcome to the SvelteKit version of Koordinator!', 'success');
	}
</script>

<svelte:head>
	<title>Koordinator</title>
</svelte:head>

<section>
	<h1>Welcome to Koordinator</h1>
	
	<p>
		This is the SvelteKit version of the Koordinator application.
	</p>
	
	<button on:click={showWelcomeNotification}>
		Show Welcome Notification
	</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
		font-size: 2.8rem;
		text-align: center;
		margin: 0 0 1rem 0;
	}

	p {
		margin: 1rem 0;
		line-height: 1.5;
	}

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

	@media (min-width: 480px) {
		h1 {
			font-size: 4rem;
		}
	}
</style>
