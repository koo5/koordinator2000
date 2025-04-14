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

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
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

    // Navigation items
    const navItems = [
        { href: '/campaigns', label: 'Campaigns', segment: 'campaigns', requiresAuth: false },
        { href: '/notifications', label: 'Notifications', segment: 'notifications', requiresAuth: true },
        { href: '/dev_area', label: 'Dev area', segment: 'dev_area', requiresAuth: false, requiresDebug: true },
        { href: '/about', label: 'About', segment: 'about', requiresAuth: false }
    ];
    
    // User dropdown state
    let userDropdownOpen = false;
    
    function toggleUserDropdown() {
        userDropdownOpen = !userDropdownOpen;
    }
    
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
        <!-- Mobile menu toggle button -->
        <button 
            class="menu-toggle-btn"
            on:click={() => (navbar_open = !navbar_open)}
            aria-label={navbar_open ? "Close menu" : "Open menu"}
        >
            {#if navbar_open}
                <X size={24} />
            {:else}
                <Menu size={24} />
            {/if}
        </button>
    </div>

    <!-- Navigation menu - desktop horizontal, mobile overlay -->
    <div class="navbar-content" class:open={navbar_open}>
        <ul class="nav-items">
            {#each navItems as item}
                {#if (!item.requiresAuth || $is_user) && (!item.requiresDebug || $debug)}
                    <li class="nav-item">
                        <a 
                            href={item.href} 
                            class="nav-link" 
                            class:active={segment === item.segment}
                        >
                            {item.label}
                        </a>
                    </li>
                {/if}
            {/each}
        </ul>
    </div>

    <!-- User dropdown menu using Bits UI inspired styling -->
    <div class="user-dropdown">
        <div class="dropdown-container" use:clickOutside={() => userDropdownOpen && (userDropdownOpen = false)}>
            <button 
                class="user-button" 
                on:click={toggleUserDropdown}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
            >
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
                <ChevronDown size={16} class={userDropdownOpen ? "chevron-icon rotated" : "chevron-icon"} />
            </button>
            
            {#if userDropdownOpen}
                <div 
                    class="dropdown-menu" 
                    transition:slide={{ duration: 150 }}
                    role="menu"
                >
                    {#if $is_user}
                        <a href="/you" class="dropdown-item" role="menuitem">Profile</a>
                        <a href="/account" class="dropdown-item" role="menuitem">Account</a>
                        <a href="/notifications" class="dropdown-item" role="menuitem">Notifications</a>
                        <a href="/add_campaign" class="dropdown-item" role="menuitem">Add campaign</a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" role="menuitem" on:click={toggle_settings}>Settings</button>
                        <button class="dropdown-item" role="menuitem" on:click={handleLogout}>Logout</button>
                    {:else}
                        <button class="dropdown-item" role="menuitem" on:click={handleLogin}>Login</button>
                        <button class="dropdown-item" role="menuitem" on:click={() => create_user(false)}>New user</button>
                    {/if}
                </div>
            {/if}
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
    .menu-toggle-btn {
        display: none;
        background: transparent;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem;
        cursor: pointer;
        color: #333;
    }
    
    .menu-toggle-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    /* Navigation container */
    .navbar-content {
        display: flex;
        align-items: center;
    }

    /* Navigation items list */
    .nav-items {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 1rem;
    }

    /* Individual nav item */
    .nav-item {
        display: flex;
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
    
    .nav-link.active {
        font-weight: 600;
        color: #1a73e8;
    }

    /* User dropdown section */
    .user-dropdown {
        margin-left: auto;
        position: relative;
        z-index: 51;
    }

    /* Dropdown container */
    .dropdown-container {
        position: relative;
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

    /* Chevron icon */
    .chevron-icon {
        opacity: 0.7;
        transition: transform 0.2s ease;
    }
    
    .chevron-icon.rotated {
        transform: rotate(180deg);
    }

    /* User name styling */
    .user-name {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }

    /* Dropdown menu */
    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.25rem;
        min-width: 12rem;
        background-color: white;
        border-radius: 0.375rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid #eee;
        padding: 0.5rem;
        z-index: 1000;
    }

    /* Dropdown items */
    .dropdown-item {
        display: block;
        width: 100%;
        text-align: left;
        background: transparent;
        border: none;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        color: #333;
        border-radius: 0.25rem;
        margin: 0;
        text-decoration: none;
        font-size: 0.875rem;
    }
    
    .dropdown-item:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    
    /* Dropdown divider */
    .dropdown-divider {
        height: 1px;
        background-color: #eee;
        margin: 0.5rem 0;
    }

    /* Mobile styles */
    @media (max-width: 767.98px) {
        .menu-toggle-btn {
            display: flex;
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

        .nav-items {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
        }

        .nav-item {
            width: 100%;
        }

        .nav-link {
            width: 100%;
            padding: 0.75rem 1rem;
        }

        .user-name {
            max-width: 100px;
        }
    }

    /* Fix for dropdown menus being hidden */
    :global(body), :global(.page), :global(main), :global(.app-container) {
        overflow-x: visible !important;
    }
</style>