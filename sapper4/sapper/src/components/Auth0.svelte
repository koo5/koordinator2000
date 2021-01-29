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

		<button on:click|preventDefault='{() => login() }'>Login</button>
		<button on:click|preventDefault='{() => logout() }'>Logout</button>
		<br/>

		{#if $isAuthenticated}
			you are authenticated
		{:else}
			you are not authenticated...but it doesn't matter, you can still play around
		{/if}

		<pre>isLoading: {$isLoading}</pre>
		<pre>isAuthenticated: {$isAuthenticated}</pre>
		<pre>authToken: {$authToken}</pre>
		<pre>idToken: {$idToken}</pre>
		<pre>userInfo: {JSON.stringify($userInfo, null, 2)}</pre>
		<pre>authError: {$authError}</pre>

		{#if $my_user.auth_debug}

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
