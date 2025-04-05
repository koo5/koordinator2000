<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import { page } from '$app/state';
    import { my_user } from '$lib/client/my_user.ts';
    import { mobile } from '$lib/platform';
    import SettingsModal from 'src/components/SettingsModal.svelte';
    import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from './ui';
    import TheNagModal from 'src/components/TheNagModal.svelte';
    import KeycloakStatus from './KeycloakStatus.svelte';
    import { public_env } from '$lib/public_env';

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
</script>

<Navbar expand="md" light>
    <NavbarBrand href="/">
        <img alt="logo" src="/favicon.ico" style="width:1em; height:1em;" />
    </NavbarBrand>
    <PageReloadClock />
    <NavbarToggler on:click={() => (navbar_open = !navbar_open)} />
    <Collapse expand="md" isOpen={navbar_open} navbar on:update={e => navbar_handleUpdate(e)}>
        <NavItem>
            <NavLink active={segment === 'campaigns'} href="/campaigns">Campaigns</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'add_campaign'} href="/add_campaign">Add campaign</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'notifications'} href="/notifications">Notifications</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'dev_area'} href="/dev_area">Dev area</NavLink>
        </NavItem>

        <NavItem>
            <NavLink active={segment === 'about'} href="/about">About</NavLink>
        </NavItem>

        <NavItem>
            <NavLink click={toggle_settings} href="#">Settings</NavLink>
        </NavItem>

        {#if $my_user}
            <NavItem align="right">
                <NavLink href="/you" active={segment === 'you'}>
                    {$my_user.name || 'You'}
                    {#if $my_user?.auth_debug} (id: {$my_user.id}) {/if}
                </NavLink>
            </NavItem>
        {:else}
            <NavItem align="right">
                <NavLink href="/login" active={segment === 'login'}>Login</NavLink>
            </NavItem>
        {/if}
    </Collapse>
</Navbar>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal} />
<TheNagModal />
