<script>
	//import "@fontsource/aguafina-script/400.css";
  	import { Col, Container, Row } from 'sveltestrap';
	import SettingsModal from 'cmps/SettingsModal.svelte';
	import TheNagModal from 'cmps/TheNagModal.svelte';
	import Nav from 'cmps/Nav.svelte';
	import {setClient} from 'svelte-apollo';
	import {new_apollo_client} from 'srcs/apollo.js';
	import {
		Auth0Context,
		idToken,
		userInfo,
	} from '@dopry/svelte-auth0';
	import {my_user, ensure_we_exist, apply_newly_authenticated_user, event} from 'srcs/my_user.js';
	import {onMount} from "svelte";
	import {stores} from '@sapper/app'
	import {theme} from 'srcs/browser_theme_setting.js'

	theme().subscribe((x) =>
	{
		if (process.browser && !$my_user.override_browser_setting)
			$my_user.invert = (x == 'dark');
	});

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
		//console.log("ensure_we_exist()");
		let u = await ensure_we_exist();
		if (u)
			await apply_newly_authenticated_user(u)
	});

	$: color_theme_hue_rotate = $my_user.hue_rotate;
	$: color_theme_saturate = $my_user.saturate;
	$: color_theme_invert = $my_user.invert;
	$: color_theme_contrast = $my_user.contrast;
	$: set_css_var('--hue_rotate', ((color_theme_invert ? 180 : 0) + (color_theme_hue_rotate || 0)) + "deg");
	$: set_css_var('--saturate', (100 + (color_theme_saturate || 0)) + "%");
	$: set_css_var('--invert', (color_theme_invert ? 100 : 0) + "%");
	$: set_css_var('--contrast', (100 + (color_theme_contrast || 0)) + "%");

	function set_css_var(name, value)
	{
		if (!process.browser) return;
		document.documentElement.style.setProperty(name, value);
	}

	let toggle_settings;

</script>

<style>

    :global(html) {
        margin: 0 auto;
        background: #dddddd;
        filter: hue-rotate(var(--hue_rotate)) contrast(var(--contrast)) invert(var(--invert)) saturate(var(--saturate));
        height: 100%;
    }

    main {
        background: white;
    }

    :global(.content_block) {
        margin: 0 auto;
        max-width: 60rem;
        padding: 3vh 3vw
    }

    :global(h1, h2, h3, h4, h5) {
		/*font-family: "Aguafina";*/

        border-left-color: #ffcc88;
        border-left-style: solid;
        border-left-width: 1vw;
        border-radius: 100em 0em 0em 100em;
        /*border-right-style: solid;
		border-right-width: 7vw;
		border-right-color: rgb(238, 248, 114);*/

        background: #eee;
        /*margin: 1em;
        margin-left: -3vw;
        padding-left: 2vw;*/

        margin-top: 1em;
        margin-bottom: 1em;
        padding-top: 0.5em;
        padding-bottom: 0.5em;
        padding-left: clamp(6vw, calc(((30rem - 50%) - 5em)), calc((30rem - 50%)));
        margin-left: clamp(0px, calc(((50% - 30rem) - 5em) + 6vw), calc((50% - 30rem) + 6vw));

    }

    :global(h1) {
        font-size: 310%;
    }

    @keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @-o-keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @-moz-keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @-webkit-keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    :global(.animate-flicker) {
        -webkit-animation: flickerAnimation 1s infinite;
        -moz-animation: flickerAnimation 1s infinite;
        -o-animation: flickerAnimation 1s infinite;
        animation: flickerAnimation 1s infinite;
    }

    :global(.dev) {
        border-style: dotted;
        background-color: rgb(230, 230, 230);
    }


</style>

{#if process.browser && $my_user}

	<Auth0Context
			{domain}
			{client_id}
			{audience}

			{callback_url}
			{logout_url}>



<Container>
  <Row>
    <Col>
   		<Nav {segment} {toggle_settings}/>
    </Col>
  </Row>
  <Row>
    <Col xs="3">
		<SettingsModal bind:toggle_settings={toggle_settings}/>
		<TheNagModal/>
    </Col>
    <Col xs="auto">
		<main>
			<slot></slot>
		</main>
    </Col>

    <Col xs="3">.col-3</Col>
  </Row>
</Container>



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
	<div class="content_block">
		Koordinator is like kickstarter, but it's not for collecting money, it's for collective action. See the <a
			href="https://github.com/koo5/koordinator2000/">code.</a><br>
		<p>
		<div class="animate-flicker">Loading...</div>
	</div>
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
