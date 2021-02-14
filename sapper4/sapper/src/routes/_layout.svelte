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
	import {my_user, ensure_we_exist, apply_newly_authenticated_user, event} from 'srcs/my_user.js';
	import { onMount } from "svelte";
	const {page, session} = stores()


	$: PUBLIC_URL = $session.PUBLIC_URL;
	$: callback_url = PUBLIC_URL + "/you"
	$: logout_url = PUBLIC_URL + "/you"

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

	onMount(async () =>
	{
		console.log("ensure_we_exist()");
		let u = await ensure_we_exist();
		if (u)
			await apply_newly_authenticated_user(u)
	});

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
/*

	nav {
		border-bottom: 1px solid rgba(255, 62, 0, 0.1);
		font-weight: 300;
		padding: 0 1em;
	}
*/

:global(html) {
    padding:12px;
        background: salmon;
	filter: hue-rotate(0deg) contrast(1) invert(0) saturate(2);
}
@media (min-width:420px) {
   :global(html) {
    padding: 3vw 12vw 3vw 8vh;
   }
}

:global(h1, h2, h3, h4, h5) {
    font-family:serif;
}
:global(h1) {
    font-size:310%;
    margin-left:-3vw;
    padding-left:2vw;
    border-left:1vw ridge #f88072
}

:global(body) {
    margin:0 auto;
    max-width:600px;
}
main {
    background:white;
    box-shadow:20px 50px 3px;
    padding:3vh 3vw
}
/*
:global(nav) {
    background:#333333;
    border-bottom:10px dotted #f88072;
    display:block;
    color:white;
}
*/
:global(h2) {
    padding:22px 0 12px 0;
}

</style>

{#if process.browser && $my_user}

	<Auth0Context
			{domain}
			{client_id}
			{audience}

			{callback_url}
			{logout_url}>

		<Nav {segment}/>

		<main>
			<slot></slot>
		</main>

		{#if $my_user.auth_debug}
			auth0 configuration:
			<pre>
				audience = {audience}
				domain = {domain}
				client_id = {client_id}

				PUBLIC_URL = {PUBLIC_URL}
				callback_url = {callback_url}
				logout_url = {logout_url}
			</pre>

		{/if}
	</Auth0Context>


{:else}
	Koordinator is like kickstarter, but it's not for collecting money, it's for collective action. <a href="https://github.com/koo5/koordinator2000/">README.</a>
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
