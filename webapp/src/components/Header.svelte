<script lang="ts">
    import PageReloadClock from './PageReloadClock.svelte';
    import { page } from '$app/stores';
    import { create_user, is_user, my_user, type MyUser } from '$lib/client/my_user';
    import type { SharedStore } from '$lib/client/svelte-shared-store';
    import SettingsModal from './SettingsModal.svelte';
    import { debug } from '$lib/stores.ts';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import TheNagModal from './TheNagModal.svelte';
    import { public_env } from '$lib/public_env';
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';

    // Import Bits UI components
    import { DropdownMenu, NavigationMenu } from 'bits-ui';

    // Import Lucide icons
    import { Menu, X, ChevronDown } from 'lucide-svelte';

    $: currentPath = $page?.url?.pathname || '/';
    $: segment = currentPath === '/' ? undefined : currentPath.split('/')[1];

    // Start with navbar closed by default on mobile
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
        
        // Handle document clicks to close mobile menu 
        const handleDocumentClick = (event: MouseEvent) => {
            // Skip if we're on desktop
            if (window.innerWidth >= 768) return;
            
            // Get the navbar content element and toggle button
            const navbarContent = document.getElementById('navbar-content');
            const toggleButton = document.querySelector('.menu-toggle-btn');
            
            // If we clicked outside both the navbar and the toggle button, close the menu
            if (navbar_open && 
                navbarContent && 
                toggleButton && 
                !navbarContent.contains(event.target as Node) && 
                !toggleButton.contains(event.target as Node)) {
                navbar_open = false;
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleDocumentClick);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleDocumentClick);
            clearTimeout(resizeTimeout);
        };
    });

    // Settings modal state
    let settingsModalOpen = false;

    function closeSettingsModal(): void {
        settingsModalOpen = false;
    }

    function toggle_settings(): void {
        console.log('toggle_settings');
        settingsModalOpen = !settingsModalOpen;
    }

    function handleLogout() {
        if (!browser) return; // Skip during SSR

        // First set my_user to {id:-1} for both logout types
        (my_user as SharedStore<MyUser>).set({id: -1, settings: {}});

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

    // Navigation items
    const navItems = [
        { href: '/campaigns', label: 'Campaigns', segment: 'campaigns', requiresAuth: false },
        { href: '/notifications', label: 'Notifications', segment: 'notifications', requiresAuth: true },
        { href: '/dev_area', label: 'Dev area', segment: 'dev_area', requiresAuth: false, requiresDebug: true },
        { href: '/about', label: 'About', segment: 'about', requiresAuth: false }
    ];

    // Click outside directive
    function clickOutside(node: HTMLElement, callback: () => void) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node) && event.which === 1) {
                callback();
            }
        };

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callback();
            }
        };

        document.addEventListener('click', handleClick, true);
        document.addEventListener('keydown', handleKeydown, true);

        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
                document.removeEventListener('keydown', handleKeydown, true);
            }
        };
    }
</script>

<nav class="header-navbar">
    <PageReloadClock />

    <div class="navbar-brand-section">
        <!-- Mobile menu toggle button for small screens -->
        <button
            type="button"
            class="menu-toggle-btn"
            on:click|preventDefault|stopPropagation={() => {
                navbar_open = !navbar_open;
                console.log('Menu toggled, new state:', navbar_open);
            }}
            aria-label={navbar_open ? "Close menu" : "Open menu"}
            aria-expanded={navbar_open}
            aria-controls="navbar-content"
        >
            <span class="icon-container">
                {#if navbar_open}
                    <X size={24} />
                {:else}
                    <Menu size={24} />
                {/if}
            </span>
        </button>
    </div>

    <!-- Navigation menu using NavigationMenu from Bits UI -->
    <div 
        id="navbar-content" 
        class="navbar-content" 
        class:open={navbar_open}
        use:clickOutside={() => {
            if (window.innerWidth < 768 && navbar_open) {
                navbar_open = false;
            }
        }}
    >
        <NavigationMenu.Root orientation="horizontal">
            <NavigationMenu.List>
                {#each navItems as item}
                    {#if (!item.requiresAuth || $is_user) && (!item.requiresDebug || $debug)}
                        <NavigationMenu.Item value={item.segment}>
                            <NavigationMenu.Link 
                                href={item.href} 
                                class="nav-link"
                                active={segment === item.segment}
                                on:click={() => {
                                    if (window.innerWidth < 768) {
                                        navbar_open = false;
                                    }
                                }}
                            >
                                {item.label}
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    {/if}
                {/each}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    </div>

    <!-- User dropdown menu using Bits UI -->
    <div class="user-dropdown">
        <div>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <div class="user-button" role="button" tabindex="0">
                        {#if $is_user}
                            <span class="user-name">
                                {#if $my_user.name}
                                    {$my_user.name}
                                {:else}
                                    You (ID {$my_user.id})
                                {/if}
                            </span>
                            {#if $my_user?.auth_debug} ({$my_user.auth_name}){/if}
                            {#if $my_user?.auth_debug} ({$my_user.auth_provider}){/if}
                            {#if $my_user?.auth_debug} ({$my_user.auth_type}){/if}
                            {#if $my_user?.auth_debug} (id: {$my_user.id}){/if}
                        {:else}
                            User
                        {/if}
                        <ChevronDown class="chevron-icon" size={16} />
                    </div>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content class="dropdown-menu">
                    {#if $is_user}
                        <DropdownMenu.Item>
                            <a href="/you" class="dropdown-link">Profile</a>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                            <a href="/account" class="dropdown-link">Account</a>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                            <a href="/notifications" class="dropdown-link">Notifications</a>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                            <a href="/add_campaign" class="dropdown-link">Add campaign</a>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item on:click={toggle_settings}>
                            Settings
                        </DropdownMenu.Item>
                        <DropdownMenu.Item on:click={handleLogout}>
                            Logout
                        </DropdownMenu.Item>
                    {:else}
                        <DropdownMenu.Item on:click={handleLogin}>
                            Login
                        </DropdownMenu.Item>
                        <DropdownMenu.Item on:click={() => create_user(false)}>
                            New user
                        </DropdownMenu.Item>
                    {/if}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>
</nav>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal} />
<TheNagModal />

<style>
    /* Header container */
    .header-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        width: 100%;
        max-width: 100vw;
        position: relative;
        background-color: white;
        border-bottom: 1px solid #eee;
        z-index: 50;
    }

    /* Brand section with logo and mobile toggle */
    .navbar-brand-section {
        display: flex;
        align-items: center;
    }

    /* Mobile menu toggle button - only visible on mobile */
    :global(.menu-toggle-btn) {
        display: none !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0.25rem !important;
        padding: 0.5rem !important;
        cursor: pointer !important;
        color: #333 !important;
        outline: none !important;
        margin-right: 0.5rem !important;
    }

    :global(.menu-toggle-btn .icon-container) {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }

    :global(.menu-toggle-btn:hover) {
        background-color: rgba(0, 0, 0, 0.05) !important;
    }
    
    :global(.menu-toggle-btn:focus) {
        box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.5) !important;
    }

    /* Navigation container */
    .navbar-content {
        display: flex;
        align-items: center;
    }
    /* Navigation links */
    .nav-link {
        padding: 0.5rem 0.75rem;
        color: #333;
        text-decoration: none;
        border-radius: 0.25rem;
        transition: all 0.2s ease;
    }

    .nav-link:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }


    /* User dropdown section */
    .user-dropdown {
        margin-left: auto;
        position: relative;
        z-index: 51;
    }

    /* User button styling */
    .user-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        background: transparent;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        color: #333;
    }

    .user-button:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }


    /* User name styling */
    .user-name {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }

    /* Dropdown menu styling */
    :global(.dropdown-menu) {
        background-color: white !important;
        border-radius: 0.375rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        border: 1px solid #eee !important;
        padding: 0.5rem !important;
        min-width: 12rem !important;
        z-index: 1000 !important;
    }

    :global(.bits-dropdown-menu-item) {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.875rem !important;
        border-radius: 0.25rem !important;
        cursor: pointer !important;
        outline: none !important;
    }

    :global(.bits-dropdown-menu-item:hover) {
        background-color: rgba(0, 0, 0, 0.05) !important;
    }
    
    :global(.bits-dropdown-menu-item:focus-visible) {
        background-color: rgba(0, 0, 0, 0.05) !important;
        box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.5) !important;
    }

    :global(.bits-dropdown-menu-item a), :global(.dropdown-link) {
        color: #333 !important;
        text-decoration: none !important;
        display: block !important;
        width: 100% !important;
    }

    :global(.bits-dropdown-menu-separator) {
        height: 1px !important;
        background-color: #eee !important;
        margin: 0.5rem 0 !important;
    }

    /* Mobile styles */
    @media (max-width: 767.98px) {
        :global(.menu-toggle-btn) {
            display: flex !important;
        }

        .navbar-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 1rem;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            display: none;
            z-index: 49;
        }

        .navbar-content.open {
            display: block;
        }

        .nav-link {
            width: 100%;
            padding: 0.75rem 1rem;
        }

        .user-name {
            max-width: 100px;
        }
    }

    /* Bits UI NavigationMenu styling */
    :global([data-navigation-menu-list]) {
        display: flex !important;
        gap: 0.5rem !important;
        list-style: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    :global([data-navigation-menu-item]) {
        position: relative !important;
    }
    
    :global([data-navigation-menu-link]) {
        display: block !important;
        text-decoration: none !important;
    }
    
    :global([data-navigation-menu-link][data-active]) {
        font-weight: 500 !important;
        color: #0066cc !important;
    }
    
    /* Mobile styles for NavigationMenu */
    @media (max-width: 767.98px) {
        :global([data-navigation-menu-list]) {
            flex-direction: column !important;
            width: 100% !important;
        }
    }
    
    /* Fix for dropdown menus being hidden */
    :global(body), :global(.page), :global(main), :global(.app-container) {
        overflow-x: visible !important;
    }
</style>
