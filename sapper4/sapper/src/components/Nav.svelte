<script>
	import PageReloadClock from "cmps/PageReloadClock.svelte";
	import {ensure_we_exist, apply_newly_authenticated_user, my_user, logout} from 'srcs/my_user.js';
	import {goto} from '@sapper/app';
	import {
		login,
	} from '@dopry/svelte-auth0';

	import Popover from 'svelte-popover';
	import Settings from 'cmps/Settings.svelte';


	export let segment;

	let my_user_str;
	$: my_user_str = JSON.stringify($my_user, null, ' ');
	$: authenticated = $my_user && ($my_user.id > 0);
	$: guest = !authenticated;

	/*
	 class:authenticated class:guest
	 */
</script>

{#if process.browser}


	<div>
		<PageReloadClock/>
		{#if $my_user.auth_debug}
			|
			my_user = {my_user_str}
			|
		{/if}
	</div>
	<nav>
		<ul>
			<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">Home</a></li>

			<!-- 		<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">about</a></li>
			<li><a rel=prefetch aria-current="{segment === 'blog' ? 'page' : undefined}" href="blog">blog</a></li> -->
			<li><a rel=prefetch aria-current="{segment === 'campaigns' ? 'page' : undefined}"
				   href="campaigns">Campaigns</a></li>
			<li><a rel=prefetch aria-current="{segment === 'add_campaign' ? 'page' : undefined}" href="add_campaign">Add
				campaign</a></li>
			<!--		<li><a rel=prefetch aria-current="{segment === 'causes' ? 'page' : undefined}" href="causes">Causes</a></li>
			<li><a rel=prefetch aria-current="{segment === 'add_cause' ? 'page' : undefined}" href="add_cause">Add Cause</a></li>   -->
			<li><a rel=prefetch aria-current="{segment === 'notifications' ? 'page' : undefined}" href="notifications">Notifications</a>
			</li>
			<!--	<li><a rel=prefetch aria-current="{segment === 'users' ? 'page' : undefined}" href="users">users</a></li>  -->

			<li><a rel=prefetch aria-current="{segment === 'you' ? 'page' : undefined}" href="you">You</a></li>

			<li>
				<Popover>
					<button slot=target class="link">Settings</button>
					<span slot=content>
				  <span class="pop_up">
					<Settings/>
				  </span>
			  </span>
				</Popover>
			</li>


		</ul>
	</nav>

{/if}


<style>


	/*
		.cell {
			display: table-cell;
		}
	*/
	.pop_up {
		border-bottom: 1px solid rgba(255, 62, 0, 0.1);
		padding: 1em;
		display: block;
		clear: both;
		background-color: rgb(255, 255, 200);
		color: #000;
	}

	/*
		.topnav-right {
		  align: right;
		}
	*/

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255, 62, 0);
		display: block;
		bottom: -1px;
	}

	/*
		.guest {
			background-color: rgb(255,155,155);
		}

		.authenticated {
			background-color: rgb(155,255,155);
		}
	*/
	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>
