<script>
	import {my_user, register, logout} from 'srcs/my_user.js';
	import Auth0 from "cmps/Auth0.svelte";
	import {login} from '@dopry/svelte-auth0';


	function save()
	{

	}

</script>

<p></p>

account ID: {$my_user.id}

<p></p>

<h3>Change username:</h3>
<input type="text" id="title" bind:value={$my_user.name}/>
<button on:click|preventDefault='{() => save() }'>Save</button>
<br><br>

	{#if $my_user.id > 0}
		<h3>Link your account to a social login:</h3>
		<Auth0 />
		<br><br>
		<form class="cell" on:submit={logout}><button  class="cell"  type="submit">Log out</button></form>
		<br><br>
	{:else}
		<h3>Log in:</h3>
		<Auth0 />
		<br><br>

<!--		<button  class="cell"  on:click|preventDefault='{() => login() }'>Log in</button> -->
		<button  class="cell"  on:click={register}>New user</button>
		<br><br>
	{/if}

{#if $my_user.auth_debug}
	<h3>debug:</h3>
	<pre>
		{JSON.stringify($my_user, null, '  ')}
	</pre>
{/if}
