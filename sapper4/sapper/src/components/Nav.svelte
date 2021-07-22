<script>
	import PageReloadClock from "src/components/PageReloadClock.svelte";
	import {my_user} from 'src/my_user.js';
	import {
		Collapse,
		Navbar,
		NavbarToggler,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
	} from 'sveltestrap';

	export let segment;
	export let toggle_settings;

	$: my_user_str = JSON.stringify($my_user, null, ' ');

	let navbar_open = false;
	function navbar_handleUpdate(event) {navbar_open = event.detail.isOpen;}


</script>

{#if process.browser}

	{#if $my_user.auth_debug}|$my_user = {my_user_str}|{/if}

	<Navbar light expand="md">
		<NavbarBrand href="/">
			<img src="/favicon.ico" alt="logo"  style="width:1em; height:1em;" />
		</NavbarBrand>
		<PageReloadClock/>
		<NavbarToggler on:click={() => (navbar_open = !navbar_open)}/>
		<Collapse isOpen={navbar_open} navbar expand="md" on:update={(e) => navbar_handleUpdate(e)}>
			<Nav class="ml-auto" navbar>

				<NavItem>
					<NavLink rel=prefetch href="." active={segment === undefined}>Home</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="campaigns" active={segment === "campaigns"}>Campaigns</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="add_campaign" active={segment === "add_campaign"}>Add campaign</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="notifications" active={segment === "notifications"}>Notifications</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="dev_area" active={segment === "dev_area"}>Dev area</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="about" active={segment === "about"}>About</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="{'javascript:void(0)'}" on:click={toggle_settings}>Settings</NavLink>
				</NavItem>

				<NavItem align="right">
					<NavLink rel=prefetch href="you" active={segment === "you"}>
						{#if $my_user?.name}
							{$my_user.name}
						{:else}
							You
						{/if}
					</NavLink>
				</NavItem>

				<NavItem>
					<NavLink rel=prefetch href="login" active={segment === "login"}>Login</NavLink>
				</NavItem>

			</Nav>
		</Collapse>
	</Navbar>

{/if}
