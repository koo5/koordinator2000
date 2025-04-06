<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import {page} from '$app/stores';
    import {create_user, is_user, my_user} from '$lib/client/my_user.ts';
    import SettingsModal from 'src/components/SettingsModal.svelte';
    import {debug} from '$lib/stores.ts';
    import {onMount} from 'svelte';
import {browser} from '$app/environment';
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

    $: currentPath = $page?.url?.pathname || '/';
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
        if (!browser) return; // Skip during SSR

        // First set my_user to {id:-1} for both logout types
        my_user.set({id: -1});

        if (public_env.ENABLE_KEYCLOAK) {
            // Handle Keycloak logout
            // Create a proper Keycloak logout URL directly instead of using the route
            const logoutParams = new URLSearchParams({
                client_id: public_env.KEYCLOAK_CLIENT_ID,
                post_logout_redirect_uri: window.location.origin,
            });

            const logoutUrl = `${public_env.KEYCLOAK_URL}/realms/${public_env.KEYCLOAK_REALM}/protocol/openid-connect/logout?${logoutParams.toString()}`;
            window.location.href = logoutUrl;
        } else {
            // Handle regular logout
            goto('/');
            location.reload();
        }
    }

    function handleLogin() {
        if (!browser) return; // Skip during SSR

        console.log('handleLogin - Keycloak enabled:', public_env.ENABLE_KEYCLOAK);

        if (public_env.ENABLE_KEYCLOAK) {
            // Debug info
            console.log('Keycloak URL:', public_env.KEYCLOAK_URL);
            console.log('Keycloak Realm:', public_env.KEYCLOAK_REALM);
            console.log('Keycloak Client ID:', public_env.KEYCLOAK_CLIENT_ID);

            try {
                // First try the server-side route
                window.location.href = '/auth/keycloak/login';
            } catch (error) {
                console.error('Error navigating to login route:', error);

                // Fallback: Directly construct Keycloak URL if needed
                if (public_env.KEYCLOAK_URL && public_env.KEYCLOAK_REALM && public_env.KEYCLOAK_CLIENT_ID) {
                    const params = new URLSearchParams({
                        client_id: public_env.KEYCLOAK_CLIENT_ID,
                        redirect_uri: `${window.location.origin}/auth/keycloak/callback`,
                        response_type: 'code',
                        scope: 'openid email profile'
                    });

                    const loginUrl = `${public_env.KEYCLOAK_URL}/realms/${public_env.KEYCLOAK_REALM}/protocol/openid-connect/auth?${params.toString()}`;
                    console.log('Using fallback login URL:', loginUrl);
                    window.location.href = loginUrl;
                } else {
                    console.error('Missing Keycloak configuration for fallback login');
                    // Regular login as last resort
                    goto('/login');
                }
            }
        } else {
            // Regular login
            goto('/login');
        }
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
                <NavLink active={segment === 'campaigns'} href="/campaigns">Campaigns</NavLink>
            </NavItem>

            <NavItem>
                <NavLink active={segment === 'add_campaign'} href="/add_campaign">Add campaign
                </NavLink>
            </NavItem>
            {#if $is_user}
                <NavItem>
                    <NavLink active={segment === 'notifications'} href="/notifications">Notifications
                    </NavLink>
                </NavItem>
            {/if}
            {#if $debug}
                <NavItem>
                    <NavLink active={segment === 'dev_area'} href="/dev_area">Dev area</NavLink>
                </NavItem>
            {/if}
            <NavItem>
                <NavLink active={segment === 'about'} href="/about">About</NavLink>
            </NavItem>
        </div>

        <!-- Right-aligned user section -->
        <div class="navbar-nav ms-auto">
            {#if $is_user}
                <NavItem>
                    <Dropdown bind:isOpen={userDropdownOpen}>
                        <div slot="toggle" let:toggle>
                            <DropdownToggle toggle={toggle} color="link">
                                {$my_user.name || ('You (User ID: ' + $my_user.id + ')')}
                                {#if $my_user?.auth_debug} ({$my_user.auth_name}){/if}
                                {#if $my_user?.auth_debug} ({$my_user.auth_provider}){/if}
                                {#if $my_user?.auth_debug} ({$my_user.auth_type}){/if}
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
