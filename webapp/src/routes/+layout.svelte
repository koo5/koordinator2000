<script lang="ts">
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/stores';
	import { theme, user } from '$lib/stores';
	import { browser } from '$app/environment';
	import { Col, Container, Row } from '../components/ui';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import TheNagModal from '../components/TheNagModal.svelte';
	import Nav from '../components/Nav.svelte';
	import { createUrqlClient, setContextClient } from '$lib/urql.ts';
	import { idToken, userInfo } from '$lib/auth.ts';
	import { 
		my_user, 
		ensure_we_exist, 
		apply_newly_authenticated_user, 
		auth_event, 
		type MyUser, 
		type AuthEvent 
	} from '../my_user.ts';
	import { set_css_var, saturate_computate } from '../stuff.ts';
	import { initVersionCheck } from '$lib/version-check.ts';
	import { get } from 'svelte/store';
	import type { SharedStore } from '../svelte-shared-store';

	// Define types for layout data
	interface LayoutData {
		session?: {
			PUBLIC_URL?: string;
			[key: string]: any;
		};
		[key: string]: any;
	}

	export let data: LayoutData;

	$: PUBLIC_URL = data.session?.PUBLIC_URL || '';
	const callback_url = PUBLIC_URL + "/you";
	const logout_url = PUBLIC_URL + "/you";
	
	const urqlClient = createUrqlClient();
	setContextClient(urqlClient);

	// Auth0 token handling
	$: maybe_ping_server_about_this($idToken, $userInfo);
	
	async function maybe_ping_server_about_this(token: string | null, info: any): Promise<void> {
		if (!browser) return;
		
		const auth = {'auth0': {token, info}};
		
		// Need to cast to the correct type since we're in the browser
		const writableMyUser = my_user as SharedStore<MyUser>;
		writableMyUser.update((u: MyUser) => {
			return {...u, auth};
		});
		
		// Create a proper AuthEvent
		const authEventData: AuthEvent = {
			type: 'auth0',
			...get(my_user)
		};
		
		const event_result = await auth_event(authEventData);
		if (event_result && event_result.user) {
			console.log('ich bin logged in');
			writableMyUser.set(event_result.user);
		}
	}
	
	// Theme setting variables
	$: color_theme_hue_rotate = $my_user.hue_rotate;
	$: color_theme_saturate = $my_user.saturate;
	$: color_theme_invert = $my_user.invert;
	$: color_theme_contrast = $my_user.contrast;
	
	// Set CSS variables for theming
	$: set_css_var('--hue_rotate', ((color_theme_invert ? 180 : 0) + (color_theme_hue_rotate || 0)) + "deg");
	$: set_css_var('--saturate', saturate_computate(color_theme_saturate));
	$: set_css_var('--invert', (color_theme_invert ? 100 : 0) + "%");
	$: set_css_var('--contrast', (100 + (color_theme_contrast || 0)) + "%");
	
	// Settings modal state and toggle function
	let settingsModalOpen = false;
	
	function toggle_settings(): void {
		settingsModalOpen = !settingsModalOpen;
	}
	
	// Handle any client-side initialization
	onMount(async () => {
		// Note: private keys are only available server-side
		// Client-side should only handle public operations
		
		// Set user from server data if available
		if (data.user) {
			user.set(data.user);
		}
		
		// Check if we need to create a user
		try {
			let u = await ensure_we_exist();
			if (u) {
				await apply_newly_authenticated_user(u);
			}
		} catch (e) {
			console.error('Error during user initialization:', e);
		}
		
		// Verify SvelteKit versions
		initVersionCheck();
		
		console.log('SvelteKit app mounted');
	});
</script>

<svelte:head>
	<!-- Bootstrap theme -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/materia/bootstrap.min.css" 
		integrity="sha384-B4morbeopVCSpzeC1c4nyV0d0cqvlSAfyXVfrPJa25im5p+yEN/YmhlgQP/OyMZD" crossorigin="anonymous">
	
	<!-- Note: CodeMirror script is loaded in app.html -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/firepad@1.5.9/dist/firepad.css" />
	
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<!-- Show loading indicator when navigating between pages -->
{#if $navigating}
	<div class="loading-indicator">
		<div class="spinner"></div>
	</div>
{/if}

{#if browser && $my_user}
		<SettingsModal isOpen={settingsModalOpen} on:close={() => settingsModalOpen = false} />
		<TheNagModal/>
		
		<Container>
			<Row>
				<Col>
					<Nav data={{}} {toggle_settings} />
				</Col>
			</Row>
			<Row>
				<Col xs={12}>
					<main>
						<slot></slot>
					</main>
				</Col>
			</Row>
		</Container>
		
{:else}
	<div class="content_block">
		Koordinator is like kickstarter, but it's not for collecting money, it's for collective action. 
		See the <a href="https://github.com/koo5/koordinator2000/">code.</a><br>
		<p>
		<div class="animate-flicker">Koordinator is loading...</div>
	</div>
{/if}

<style>
	:root {
		--primary-color: #ff3e00;
		--background-color: white;
		--text-color: #333;
	}
	
	/* Removed unused .app selector */

	main {
		position: relative;
		background-color: #ffeeee;
		margin: 0 auto;
		box-sizing: border-box;
		flex: 1;
	}

	/* Removed unused footer selector */

	/* Removed unused .dark-mode selector */

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

	:global(#sapper) {
		background-color: #ffeeee;
	}

	:global(html) {
		margin: 0 auto;
		background-color: #ffeeee;
		filter: hue-rotate(var(--hue_rotate)) contrast(var(--contrast)) invert(var(--invert)) saturate(var(--saturate));
		height: 100%;
	}

	:global(.navbar) {
		background: #ffffee !important;
		margin-bottom: 1em;
	}

	:global(.content_block) {
		margin: 0 auto;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
		max-width: 60rem;
		padding: 3vh 3vw;
		background: #ffffee;
		box-shadow: 0 1px 4px rgb(0 0 0 / 40%);
	}

	:global(h1, h2, h3, h4, h5) {
		background: #dddddd;
		margin: 1em;
		margin-top: 1em;
		margin-bottom: 1em;
		padding-top: 0;
		padding-bottom: 0;
	}

	@keyframes flickerAnimation {
		0% { opacity: 1; }
		50% { opacity: 0; }
		100% { opacity: 1; }
	}

	@-o-keyframes flickerAnimation {
		0% { opacity: 1; }
		50% { opacity: 0; }
		100% { opacity: 1; }
	}

	@-moz-keyframes flickerAnimation {
		0% { opacity: 1; }
		50% { opacity: 0; }
		100% { opacity: 1; }
	}

	@-webkit-keyframes flickerAnimation {
		0% { opacity: 1; }
		50% { opacity: 0; }
		100% { opacity: 1; }
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
