<script lang='js'>

	import {
		Auth0Context,
		authError,
		authToken,
		idToken,
		isAuthenticated,
		isLoading,
		login,
		logout,
		userInfo,
	} from '@dopry/svelte-auth0';
	import {get} from 'svelte/store';
	import {stores} from '@sapper/app'
	import {my_user, event} from 'srcs/my_user.js';

	const {page, preloading, session} = stores()


</script>

{#if process.browser}

		<br/>

		{#if $isAuthenticated}
			you are authenticated as: {JSON.stringify($my_user && $my_user.auth && $my_user.auth.auth0 && $my_user.auth.auth0.info && $my_user.auth.auth0.info.sub)}<br/>
			<button on:click|preventDefault='{() => logout() }'>Unauthenticate</button>
		{:else}
			you are not authenticated.<br/>
			<button on:click|preventDefault='{() => login() }'>Authenticate with Google/Twitter/Facebook/Solid...</button>
		{/if}

		{#if $my_user.auth_debug}

			<pre>isLoading: {$isLoading}</pre>
			<pre>isAuthenticated: {$isAuthenticated}</pre>
			<pre>authToken: {$authToken}</pre>
			<pre>idToken: {$idToken}</pre>
			<pre>userInfo: {JSON.stringify($userInfo, null, 2)}</pre>
			<pre>authError: {$authError}</pre>

			page:
			<pre>{JSON.stringify($page, null, '  ')}</pre>
			preloading:
			<pre>{JSON.stringify($preloading, null, '  ')}</pre>
			session:
			<pre>{JSON.stringify($session, null, '  ')}</pre>

		{/if}

{:else}
	loading..
{/if}
