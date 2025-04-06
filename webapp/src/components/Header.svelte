<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import { page } from '$app/state';
    import { my_user } from '$lib/client/my_user.ts';
    import { mobile } from '$lib/platform';
    import SettingsModal from 'src/components/SettingsModal.svelte';
    import {
        Collapse,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink,
        Dropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem
    } from './ui';
    import TheNagModal from 'src/components/TheNagModal.svelte';
    import KeycloakStatus from './KeycloakStatus.svelte';
    import { public_env } from '$lib/public_env';
    import { goto } from '$app/navigation';

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
        // Implement logout functionality here
        if (public_env.ENABLE_KEYCLOAK) {
            goto('/auth/keycloak/logout');
        } else {
            // Handle regular logout
            localStorage.removeItem('my_user');
            goto('/');
            location.reload();
        }
    }
</script>

<Navbar expand="md" light>
    <NavbarBrand href="/">
        <img alt="logo" src="/favicon.ico" style="width:1em; height:1em;" />
    </NavbarBrand>
    <PageReloadClock />
    <NavbarToggler on:click={() => (navbar_open = !navbar_open)} />
    <Collapse expand="md" isOpen={navbar_open} navbar on:update={e => navbar_handleUpdate(e)}>
        <NavItem>
            <NavLink active={segment === 'campaigns'} href="/campaigns" click={undefined}>Campaigns</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'add_campaign'} href="/add_campaign" click={undefined}>Add campaign</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'notifications'} href="/notifications" click={undefined}>Notifications</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'dev_area'} href="/dev_area" click={undefined}>Dev area</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'about'} href="/about" click={undefined}>About</NavLink>
        </NavItem>

        {#if $my_user}
            <NavItem align="right">
                <Dropdown bind:isOpen={userDropdownOpen}>
                    <div slot="toggle" let:toggle>
                        <DropdownToggle toggle={toggle} color="link">
                            {$my_user.name || 'You'}
                            {#if $my_user?.auth_debug} (id: {$my_user.id}) {/if}
                        </DropdownToggle>
                    </div>
                    <div slot="menu">
                        <DropdownMenu right>
                            <DropdownItem href="/login">Switch account</DropdownItem>
                            <DropdownItem href="/you">Profile</DropdownItem>
                            <DropdownItem href="/account">Account</DropdownItem>
                            <DropdownItem on:click={toggle_settings}>Settings</DropdownItem>
                            <DropdownItem on:click={handleLogout}>Logout</DropdownItem>
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
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal} />
<TheNagModal />
