<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import {page} from '$app/state';
    import {create_user, is_user, my_user} from '$lib/client/my_user.ts';
    import {mobile} from '$lib/platform';
    import SettingsModal from 'src/components/SettingsModal.svelte';
    import {
        Collapse,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink
    } from './ui';
    import TheNagModal from 'src/components/TheNagModal.svelte';
    import {public_env} from '$lib/public_env';
    import {goto} from '$app/navigation';

    $: currentPath = page.url.pathname;
    $: segment = currentPath === '/' ? undefined : currentPath.split('/')[1];

    // make navbar always open on desktop
    let navbar_open = !$mobile;

    interface UpdateEvent {
        detail: {
            isOpen: boolean;
        };
    }

    function navbar_handleUpdate(event: UpdateEvent): void {
        navbar_open = event.detail.isOpen;
    }

    // Settings modal state
    let settingsModalOpen = false;

    function closeSettingsModal(): void {
        settingsModalOpen = false;
    }

    function toggle_settings(): void {
        console.log('toggle_settings');
        settingsModalOpen = !settingsModalOpen;
    }

    // User dropdown state
    let userDropdownOpen = false;

    function handleLogout() {
        if (public_env.ENABLE_KEYCLOAK) {
            // First set my_user to {id:-1} before Keycloak logout
            my_user.set({id: -1});
            // Redirect to keycloak logout endpoint
            goto('/auth/keycloak/logout');
        } else {
            // Handle regular logout
            my_user.set({id: -1});
            goto('/');
            location.reload();
        }
    }
</script>

<Navbar expand="md" light>
    <NavbarBrand href="/">
        <img alt="logo" src="/favicon.ico" style="width:1em; height:1em;"/>
    </NavbarBrand>
    <PageReloadClock/>
    <NavbarToggler on:click={() => (navbar_open = !navbar_open)}/>
    <Collapse expand="md" isOpen={navbar_open} navbar on:update={e => navbar_handleUpdate(e)}>
        <NavItem>
            <NavLink active={segment === 'campaigns'} click={undefined} href="/campaigns">Campaigns</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'add_campaign'} click={undefined} href="/add_campaign">Add campaign</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'notifications'} click={undefined} href="/notifications">Notifications
            </NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'dev_area'} click={undefined} href="/dev_area">Dev area</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'about'} click={undefined} href="/about">About</NavLink>
        </NavItem>

        {#if $my_user}
            <NavItem align="right">
                <Dropdown bind:isOpen={userDropdownOpen}>
                    <div slot="toggle" let:toggle>
                        <DropdownToggle toggle={toggle} color="link">
                            {$my_user.name || 'You'}
                            {#if $my_user?.auth_debug} (id: {$my_user.id}){/if}
                        </DropdownToggle>
                    </div>
                    <div slot="menu">
                        <DropdownMenu right>
                            {#if $is_user}
                                <DropdownItem href="/login">Switch account</DropdownItem>
                                <DropdownItem href="/you">Profile</DropdownItem>
                                <DropdownItem href="/account">Account</DropdownItem>
                                <DropdownItem on:click={toggle_settings}>Settings</DropdownItem>
                                <DropdownItem on:click={handleLogout}>Logout</DropdownItem>
                            {:else}
                                <DropdownItem href="/login">Login</DropdownItem>
                                <DropdownItem on:click={() => create_user(false)} >New user</DropdownItem>
                            {/if}
                        </DropdownMenu>
                    </div>
                </Dropdown>
            </NavItem>
        {:else}
            <NavItem align="right">
                <NavLink href="/login" active={segment === 'login'} click={undefined}>Login</NavLink>
            </NavItem>
        {/if}
    </Collapse>
</Navbar>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal}/>
<TheNagModal/>
