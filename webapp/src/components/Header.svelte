<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import {page} from '$app/state';
    import {create_user, is_user, my_user} from '$lib/client/my_user.ts';
    import SettingsModal from 'src/components/SettingsModal.svelte';
    import {debug} from '$lib/stores.ts';
    import {onMount} from 'svelte';
    import {
        Collapse,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Navbar,
        NavbarToggler,
        NavItem,
        NavLink
    } from './ui';
    import TheNagModal from 'src/components/TheNagModal.svelte';
    import {public_env} from '$lib/public_env';
    import {goto} from '$app/navigation';

    $: currentPath = page.url.pathname;
    $: segment = currentPath === '/' ? undefined : currentPath.split('/')[1];

    // Start with navbar closed by default
    let navbar_open = false;

    // Update navbar state based on screen size after component mounts
    onMount(() => {
        // Check if we're on desktop
        const isDesktop = window.innerWidth >= 768;
        navbar_open = isDesktop;

        // Add window resize listener to adjust navbar state with throttling
        let resizeTimeout: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const isDesktopNow = window.innerWidth >= 768;
                // Open on desktop, close on mobile
                navbar_open = isDesktopNow;
            }, 100); // 100ms throttle
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    });

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

    function handleLogin() {
        console.log('handleLogin');
        goto('/auth/keycloak/login');
    }
</script>

<Navbar expand="md" light>
    <PageReloadClock/>
    <div class="navbar-toggler-container">
        <NavbarToggler on:click={() => (navbar_open = !navbar_open)}/>
    </div>
    <Collapse expand="md" isOpen={navbar_open} navbar on:update={e => navbar_handleUpdate(e)}>
        <!-- Left-aligned navigation items -->
        <div class="navbar-nav me-auto">
            <NavItem>
                <NavLink active={segment === 'campaigns'} click={undefined} href="/campaigns">Campaigns</NavLink>
            </NavItem>

            <NavItem>
                <NavLink active={segment === 'add_campaign'} click={undefined} href="/add_campaign">Add campaign
                </NavLink>
            </NavItem>
            {#if $is_user}
                <NavItem>
                    <NavLink active={segment === 'notifications'} click={undefined} href="/notifications">Notifications
                    </NavLink>
                </NavItem>
            {/if}
            {#if $debug}
                <NavItem>
                    <NavLink active={segment === 'dev_area'} click={undefined} href="/dev_area">Dev area</NavLink>
                </NavItem>
            {/if}
            <NavItem>
                <NavLink active={segment === 'about'} click={undefined} href="/about">About</NavLink>
            </NavItem>
        </div>

        <!-- Right-aligned user section -->
        <div class="navbar-nav ms-auto">
            {#if $is_user}
                <NavItem>
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
                                    <DropdownItem onClick={handleLogin}>Switch account</DropdownItem>
                                    <DropdownItem href="/you">Profile</DropdownItem>
                                    <DropdownItem href="/account">Account</DropdownItem>
                                    <DropdownItem onClick={toggle_settings}>Settings</DropdownItem>
                                    <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                                {:else}
                                    <DropdownItem onClick={handleLogin}>Login</DropdownItem>
                                    <DropdownItem onClick={() => create_user(false)}>New user</DropdownItem>
                                {/if}
                            </DropdownMenu>
                        </div>
                    </Dropdown>
                </NavItem>
            {:else}
                <NavItem>
                    <NavLink href="#" onClick={handleLogin} active={segment === 'login'} >Login
                    </NavLink>
                </NavItem>
            {/if}
        </div>
    </Collapse>
</Navbar>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal}/>
<TheNagModal/>

<style>
    .me-auto {
        margin-right: auto !important;
    }

    .ms-auto {
        margin-left: auto !important;
    }

    .navbar-nav {
        display: flex;
        flex-direction: row;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        align-items: center;
    }

    /* Hide navbar toggler except on mobile */
    .navbar-toggler-container {
        display: none;
    }

    /* Only show navbar toggler on mobile screens */
    @media (max-width: 767.98px) {
        .navbar-toggler-container {
            display: block;
        }
    }

    /* The navbar state is controlled by JavaScript rather than CSS overrides */
</style>
