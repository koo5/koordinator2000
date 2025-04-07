<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import {page} from '$app/stores';
    import {create_user, is_user, my_user, type MyUser} from '$lib/client/my_user';
    import type { SharedStore } from '$lib/client/svelte-shared-store';
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
        (my_user as SharedStore<MyUser>).set({id: -1});

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

<Navbar expand="md" light class="header-navbar">
    <PageReloadClock/>
    <div class="navbar-brand-section">
        <div class="navbar-toggler-container">
            <NavbarToggler on:click={() => (navbar_open = !navbar_open)}/>
        </div>
        
        <!-- Always visible "You" button on mobile -->
        {#if $is_user}
            <div class="mobile-user-button d-md-none">
                <NavItem class="user-dropdown-container">
                    <Dropdown bind:isOpen={userDropdownOpen}>
                        <div slot="toggle" let:toggle>
                            <DropdownToggle toggle={toggle} color="link">
                                <span class="user-name">You</span>
                            </DropdownToggle>
                        </div>
                        <div slot="menu">
                            <DropdownMenu right>
                                <DropdownItem onClick={handleLogin}>Switch account</DropdownItem>
                                <DropdownItem href="/you">Profile</DropdownItem>
                                <DropdownItem href="/account">Account</DropdownItem>
                                <DropdownItem onClick={toggle_settings}>Settings</DropdownItem>
                                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                            </DropdownMenu>
                        </div>
                    </Dropdown>
                </NavItem>
            </div>
        {/if}
    </div>
    
    <!-- Mobile overlay menu and desktop horizontal menu -->
    <Collapse expand="md" isOpen={navbar_open} navbar on:update={e => navbar_handleUpdate(e)}>
        <!-- Navigation items -->
        <div class="navbar-nav">
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
            
            <!-- "You" item only shown in desktop mode or in mobile overlay -->
            <div class="d-none d-md-block user-section">
                {#if $is_user}
                    <NavItem class="user-dropdown-container">
                        <Dropdown bind:isOpen={userDropdownOpen}>
                            <div slot="toggle" let:toggle>
                                <DropdownToggle toggle={toggle} color="link">
                                    <span class="user-name">
                                    {$my_user.name || ('You')}
                                    {#if $my_user?.auth_debug} ({$my_user.auth_name}){/if}
                                    {#if $my_user?.auth_debug} ({$my_user.auth_provider}){/if}
                                    {#if $my_user?.auth_debug} ({$my_user.auth_type}){/if}
                                    {#if $my_user?.auth_debug} (id: {$my_user.id}){/if}
                                    </span>
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
            
            <!-- Login link only in mobile overlay and only if not logged in -->
            <div class="d-md-none">
                {#if !$is_user}
                    <NavItem>
                        <NavLink href="#" onClick={handleLogin} active={segment === 'login'} >Login
                        </NavLink>
                    </NavItem>
                {/if}
            </div>
        </div>
    </Collapse>
</Navbar>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal}/>
<TheNagModal/>

<style>
    /* Utility classes for margin control - used as class names in the template */
    :global(.me-auto) {
        margin-right: auto !important;
    }

    :global(.ms-auto) {
        margin-left: auto !important;
    }

    .navbar-nav {
        display: flex;
        flex-direction: row;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        align-items: center;
        flex-wrap: nowrap !important; /* Prevent items from wrapping */
        white-space: nowrap !important;
    }

    /* Hide navbar toggler except on mobile */
    .navbar-toggler-container {
        display: none;
    }

    /* User dropdown specific adjustments */
    :global(.user-dropdown-container) {
        position: relative;
        white-space: nowrap;
        z-index: 20000; /* High z-index to ensure dropdown visibility */
    }

    /* Force the dropdown to always be visible regardless of other elements */
    :global(.user-dropdown-container .dropdown) {
        position: static;
    }

    :global(.user-dropdown-container .dropdown-menu) {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 2000;
    }

    /* Header-specific styles */
    :global(.header-navbar) {
        width: 100%;
        max-width: 100vw; /* Prevent overflow */
        overflow: visible !important; /* Force dropdowns to be visible beyond boundaries */
        display: flex !important;
        flex-direction: row !important;
        padding: 0.5rem 1rem;
        z-index: 1030; /* Ensure it's above content */
    }
    
    /* Make sure all navbar elements allow overflow */
    :global(.navbar), 
    :global(.navbar-collapse),
    :global(.navbar-nav),
    :global(.nav-item) {
        overflow: visible !important;
    }

    /* Brand section styling */
    .navbar-brand-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1;
    }
    
    /* Mobile user button styling */
    .mobile-user-button {
        margin-left: auto;
        margin-right: 1rem;
    }
    
    /* User section styling - desktop only */
    .user-section {
        margin-left: auto;
        display: flex !important;
        white-space: nowrap !important;
    }

    /* User name styles */
    :global(.user-name) {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px; /* Limit width on larger screens */
    }

    /* Mobile responsiveness improvements */
    @media (max-width: 767.98px) {
        .navbar-toggler-container {
            display: block;
        }

        /* Make sure the navbar header is properly styled */
        :global(.navbar) {
            width: 100%;
            max-width: 100%;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            box-sizing: border-box;
            position: relative;
        }
        
        /* MOBILE OVERLAY STYLING */
        /* Style the mobile overlay menu */
        :global(.navbar-collapse) {
            position: absolute !important;
            top: 100% !important; /* Position right below the header */
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background-color: #f8f9fa !important;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
            z-index: 1030 !important;
            padding: 1rem !important;
            border-bottom-left-radius: 8px !important;
            border-bottom-right-radius: 8px !important;
            flex-direction: column !important;
            display: flex !important;
        }
        
        /* Style navbar items in mobile view */
        :global(.navbar-nav) {
            flex-direction: column !important;
            width: 100% !important;
        }
        
        /* Style nav items in mobile view */
        :global(.navbar-nav .nav-item) {
            margin-bottom: 0.5rem !important;
            margin-right: 0 !important;
            width: 100% !important;
        }
        
        /* Style nav links in mobile view */
        :global(.nav-link) {
            padding: 0.75rem 1rem !important;
            border-radius: 4px !important;
        }
        
        :global(.nav-link:hover) {
            background-color: rgba(0,0,0,0.05) !important;
        }

        /* Make user name more compact on mobile */
        :global(.user-name) {
            max-width: 100px; /* Limit width on mobile */
        }

        /* Make room for items on mobile */
        :global(.dropdown-toggle) {
            padding: 0.25rem 0.5rem !important;
            font-size: 0.9rem;
        }

        /* Ensure dropdown menus are properly positioned on mobile */
        :global(.dropdown-menu) {
            position: absolute !important;
            right: 0 !important;
            left: auto !important;
        }
    }

    /* Desktop view styles */
    @media (min-width: 768px) {
        /* Ensure dropdown menus in navbar are correctly positioned */
        :global(.navbar .dropdown-menu) {
            position: absolute !important;
        }
        
        /* Style horizontal navbar on desktop */
        :global(.navbar-collapse) {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
        }
        
        /* Style navbar items in desktop view */
        :global(.navbar-nav) {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            align-items: center !important;
        }
        
        /* Style nav items in desktop view */
        :global(.navbar-nav .nav-item) {
            margin-right: 0.5rem !important;
            white-space: nowrap !important;
        }
    }
    
    /* Fix for dropdown menus being hidden */
    :global(body), :global(.page), :global(main), :global(.app-container) {
        overflow-x: visible !important;
    }

    /* The navbar state is controlled by JavaScript rather than CSS overrides */
</style>
