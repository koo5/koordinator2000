<script>
	import PageReloadClock from "cmps/PageReloadClock.svelte";
	import {my_user} from 'srcs/my_user.js';
	import Settings from 'cmps/Settings.svelte';
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'sveltestrap';

	export let segment;

	$: my_user_str = JSON.stringify($my_user, null, ' ');

	let open = false;
	const toggle = () => (open = !open);

</script>

{#if process.browser}
	<nav class="nav navbar navbar-inverse navbar-fixed-top">
		<PageReloadClock/>
		{#if $my_user.auth_debug}|$my_user = {my_user_str}|{/if}
		<ul>
			<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">Home</a></li>

			<li><a rel=prefetch aria-current="{segment === 'campaigns' ? 'page' : undefined}"
				   href="campaigns">Campaigns</a></li>
			<li><a rel=prefetch aria-current="{segment === 'add_campaign' ? 'page' : undefined}" href="add_campaign">Add
				campaign</a></li>
			<li><a rel=prefetch aria-current="{segment === 'notifications' ? 'page' : undefined}" href="notifications">Notifications</a>
			</li>
			<li>
				<a href="dev_area">Dev area</a>
			</li>

			<li>
				<a href="{'javascript:void(0)'}" on:click={toggle}>Settings</a>

				<Modal isOpen={open} {toggle} fade={false} keyboard={true} scrollable={true}>
				    <ModalHeader {toggle}>Settings</ModalHeader>
					<ModalBody>
						<Settings/>
					</ModalBody>
				    <ModalFooter>
				      <Button color="secondary" on:click={toggle}>Close</Button>
				    </ModalFooter>
				</Modal>

			</li>
			<li align="right">
				<a rel=prefetch aria-current="{segment === 'you' ? 'page' : undefined}" href="you">You</a>
			</li>

		</ul>
	</nav>

{/if}


<style>

    nav {
        padding: 0 3vw;
        margin: 0;
        /*margin: auto;
        position: sticky;
        top: 0px;*/

    }

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

    a {
        text-decoration: none;
        padding: 0em 0.5em;
        display: block;
    }

</style>
