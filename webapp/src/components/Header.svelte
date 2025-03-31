<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import { page } from '$app/state';
    import { user } from '$lib/stores';
    import { mobile } from '$lib/platform';
    import SettingsModal from '$lib/components/SettingsModal.svelte';
    import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from './ui';
    import TheNagModal from 'src/components/TheNagModal.svelte';

    $: my_user_str = JSON.stringify($user, null, ' ');
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

{#if $user?.auth_debug}|$user = {my_user_str}|{/if}

<Navbar light expand="md">
    <NavbarBrand href="/">
        <img src="/favicon.ico" alt="logo" style="width:1em; height:1em;" />
    </NavbarBrand>
    <PageReloadClock />
    <NavbarToggler on:click={() => (navbar_open = !navbar_open)} />
    <Collapse isOpen={navbar_open} navbar expand="md" on:update={e => navbar_handleUpdate(e)}>
        <NavItem>
            <NavLink href="/campaigns" active={segment === 'campaigns'}>Campaigns</NavLink>
        </NavItem>

        <NavItem>
            <NavLink href="/add_campaign" active={segment === 'add_campaign'}>Add campaign</NavLink>
        </NavItem>

        <NavItem>
            <NavLink href="/notifications" active={segment === 'notifications'}>Notifications</NavLink>
        </NavItem>

        <NavItem>
            <NavLink href="/dev_area" active={segment === 'dev_area'}>Dev area</NavLink>
        </NavItem>

        <NavItem>
            <NavLink href="/about" active={segment === 'about'}>About</NavLink>
        </NavItem>

        <NavItem>
            <NavLink href="#" click={toggle_settings}>Settings</NavLink>
        </NavItem>

        <NavItem align="right">
            <NavLink href="/you" active={segment === 'you'}>
                {#if $user?.name}
                    {$user.name}
                {:else}
                    You
                {/if}
            </NavLink>
        </NavItem>

        {#if !$user}
            <NavItem>
                <NavLink href="/login" active={segment === 'login'}>Login</NavLink>
            </NavItem>
        {/if}
    </Collapse>
</Navbar>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal} />
<TheNagModal />
