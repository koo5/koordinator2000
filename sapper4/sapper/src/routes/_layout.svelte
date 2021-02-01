<script>
	import Nav from 'cmps/Nav.svelte';
	import {setClient} from 'svelte-apollo';
	import {new_apollo_client} from 'srcs/apollo.js';
	import {
		Auth0Context,
		idToken,
		userInfo,
	} from '@dopry/svelte-auth0';
	import {stores} from '@sapper/app'
	import {my_user, event} from 'srcs/my_user.js';
	const {page, session} = stores()


	$: PUBLIC_URL = $session.PUBLIC_URL;
	$: callback_url = PUBLIC_URL + "/auth0"
	$: logout_url = PUBLIC_URL + "/auth0"
	$: audience = undefined;
	$: domain = "dev-koord11.eu.auth0.com"
	$: client_id = "GjHr32K9lxNsmzoBBdoFE44IDXg24btf"


	$: maybe_ping_server_about_this($idToken, $userInfo)

	async function maybe_ping_server_about_this(token, info)
	{
		if (!process.browser)
			return;
		/*if (!isAuthenticated)
			return;*/
		let auth = {'auth0': {token, info}};
		my_user.update((u) =>
		{
			return {...u, auth}
		});
		let event_result = await event($my_user);
		if (event_result && event_result.user)
		{
			console.log('ich bin logged in');
			my_user.set(event_result.user);
		}
	}



	export let segment;

	if (process.browser)
	{
		setClient(new_apollo_client());
	}

</script>

<style>
/*	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}*/
</style>

{#if process.browser}

	<Auth0Context
			{domain}
			{client_id}
			{audience}
			{callback_url}
			{logout_url}
	>

<Nav {segment}/>

<main>
	<slot></slot>
</main>


		{#if $my_user.auth_debug}

			auth0 configuration:
			<pre>
				PUBLIC_URL = {PUBLIC_URL}
				callback_url = {callback_url}
				logout_url = {logout_url}
				audience = {audience}
				domain = {domain}
				client_id = {client_id}
			</pre>

		{/if}


	</Auth0Context>
{:else}
	It's like kickstarter, but not for collecting money, it's for decentralized coordination of collective action.
	<p>
	loading..
{/if}


<svelte:head>

	<!-- <script src="https://www.gstatic.com/firebasejs/5.5.4/firebase.js"></script> -->
	<!-- or -->
	<!--
		<script src="https://www.gstatic.com/firebasejs/5.5.4/firebase-app.js"></script>
		<script src="https://www.gstatic.com/firebasejs/5.5.4/firebase-database.js"></script>
	-->

	<!-- CodeMirror -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.17.0/codemirror.js"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.17.0/codemirror.css"/>

	<!-- Firepad -->
	<link rel="stylesheet" href="https://firepad.io/releases/v1.5.9/firepad.css"/>
	<script src="https://firepad.io/releases/v1.5.9/firepad.js"></script>
	<!--
	<script src="https://firepad.io/releases/v1.5.10/firepad.min.js"></script>
	-->

</svelte:head>
