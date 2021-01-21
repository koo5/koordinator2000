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

	import { stores } from '@sapper/app'
	import { my_user } from 'srcs/my_user.js';

	const { page,preloading,session } = stores()

	$: PUBLIC_URL = $session.PUBLIC_URL;
	$: callback_url=PUBLIC_URL+"/auth0"
	$: logout_url=PUBLIC_URL+"/auth0"
	$: audience=undefined;
	$: domain="dev-koord11.eu.auth0.com"
	$: client_id="GjHr32K9lxNsmzoBBdoFE44IDXg24btf"

	$: maybe_ping_server_about_this(isAuthenticated)

	async function maybe_ping_server_about_this(isAuthenticated)
	{
		if (!isAuthenticated)
			return;
		event($my_user);
	}

</script>

	{#if $my_user.auth_debug}

configuration:
<pre>
PUBLIC_URL = {PUBLIC_URL}
callback_url = {callback_url}
logout_url = {logout_url}
audience = {audience}
domain = {domain}
client_id = {client_id}
</pre>

page:
<pre>{JSON.stringify($page, null, '  ')}</pre>
preloading:
<pre>{JSON.stringify($preloading, null, '  ')}</pre>
session:
<pre>{JSON.stringify($session, null, '  ')}</pre>

		{/if}

{#if process.browser}
	Auth0Context:
	<Auth0Context
			{domain}
			{client_id}
			{audience}
			{callback_url}
			{logout_url}
		>
			<button on:click|preventDefault='{() => login() }'>Login</button>
			<button on:click|preventDefault='{() => logout() }'>Logout</button><br />
	{#if $my_user.auth_debug}
			<pre>isLoading: {$isLoading}</pre>
			<pre>isAuthenticated: {$isAuthenticated}</pre>
			<pre>authToken: {$authToken}</pre>
			<pre>idToken: {$idToken}</pre>
			<pre>userInfo: {JSON.stringify($userInfo, null, 2)}</pre>
			<pre>authError: {$authError}</pre>
	{/if}
	</Auth0Context>

	{#if $isAuthenticated}
		you are authenticated
	{:else}
		you are not authenticated...but it doesn't matter
	{/if}

{:else}
	loading..
{/if}
