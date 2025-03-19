<script>
	import PageReloadClock from "src/components/PageReloadClock.svelte";
	import { user } from '$lib/stores';
	import { page } from '$app/stores';
	import {
		Collapse,
		Navbar,
		NavbarToggler,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
	} from 'sveltestrap';

	export let data;

	$: my_user_str = JSON.stringify($user, null, ' ');
	$: currentPath = $page.url.pathname;
	$: segment = currentPath === '/' ? undefined : currentPath.split('/')[1];

	let navbar_open = false;
	function navbar_handleUpdate(event) {navbar_open = event.detail.isOpen;}

	function toggle_settings() {
		// This will be implemented later
		console.log('Toggle settings');
	}
</script>

{#if $user?.auth_debug}|$user = {my_user_str}|{/if}

<Navbar light expand="md">
	<NavbarBrand href="/">
		<img src="/favicon.ico" alt="logo" style="width:1em; height:1em;" />
	</NavbarBrand>
	<PageReloadClock/>
	<NavbarToggler on:click={() => (navbar_open = !navbar_open)}/>
	<Collapse isOpen={navbar_open} navbar expand="md" on:update={(e) => navbar_handleUpdate(e)}>
		<Nav class="ml-auto" navbar>

			<NavItem>
				<NavLink href="/" active={segment === undefined}>Home</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="/campaigns" active={segment === "campaigns"}>Campaigns</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="/add_campaign" active={segment === "add_campaign"}>Add campaign</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="/notifications" active={segment === "notifications"}>Notifications</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="/dev_area" active={segment === "dev_area"}>Dev area</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="/about" active={segment === "about"}>About</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="javascript:void(0)" on:click={toggle_settings}>Settings</NavLink>
			</NavItem>

			<NavItem align="right">
				<NavLink href="/you" active={segment === "you"}>
					{#if $user?.name}
						{$user.name}
					{:else}
						You
					{/if}
				</NavLink>
			</NavItem>

			<NavItem>
				<NavLink href="/login" active={segment === "login"}>Login</NavLink>
			</NavItem>

		</Nav>
	</Collapse>
</Navbar>
