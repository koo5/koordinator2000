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
    import { goto } from '$app/navigation';

    $: currentPath = $page?.url?.pathname || '/';
    $: segment = currentPath === '/' ? undefined : currentPath.split('/')[1];

    // Start with navbar closed by default on mobile
    let navbar_open = false;

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

        // Reset to a logged-out state; the anonymous flow can mint a fresh user.
        (my_user as SharedStore<MyUser>).set({id: -1, settings: {}});
        goto('/');
        location.reload();
    }

    // Navigation items
    const navItems = [
        { href: '/campaigns', label: 'Campaigns', segment: 'campaigns', requiresAuth: false },
        { href: '/notifications', label: 'Notifications', segment: 'notifications', requiresAuth: true },
        { href: '/dev_area', label: 'Dev area', segment: 'dev_area', requiresAuth: false, requiresDebug: true },
        { href: '/about', label: 'About', segment: 'about', requiresAuth: false }
    ];

    // DaisyUI dropdown control is managed by the library
    // We don't need explicit state anymore as DaisyUI handles it
    
    // Combine all mount logic in a single onMount function
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
        
        // Handle document clicks to close mobile menu when clicking outside
        const handleDocumentClick = (event: MouseEvent) => {
            // Skip if we're on desktop or menu is already closed
            if (window.innerWidth >= 768 || !navbar_open) return;
            
            // Get the navbar content and toggle button elements
            const navbarContent = document.getElementById('navbar-content');
            const toggleButton = document.querySelector('.navbar-toggle-btn');
            
            // Close the menu if clicking outside both the navbar and toggle button
            if (navbarContent && 
                toggleButton && 
                !navbarContent.contains(event.target as Node) && 
                !toggleButton.contains(event.target as Node)) {
                navbar_open = false;
            }
            
            // DaisyUI will handle dropdown closing automatically
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleDocumentClick);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleDocumentClick);
            clearTimeout(resizeTimeout);
        };
    });
</script>

<div class="navbar bg-base-100 shadow-sm">
    <div class="flex-none flex items-center gap-2">
        <a href="/" class="brand" aria-label="Koordinator home">
            <span class="brand-mark">⇶</span><span class="brand-name">Koordinator</span>
        </a>
        {#if $debug}<PageReloadClock />{/if}
    </div>

    <div class="flex-1">
        <!-- Mobile menu toggle button -->
        <div class="md:hidden">
            <button 
                type="button"
                class="btn btn-ghost navbar-toggle-btn"
                on:click|stopPropagation={() => {
                    navbar_open = !navbar_open;
                    console.log('Menu toggled, new state:', navbar_open);
                }}
                aria-label={navbar_open ? "Close menu" : "Open menu"}
                aria-expanded={navbar_open}
                aria-controls="navbar-content"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
        
        <!-- Navigation items - Always visible on desktop, toggled on mobile -->
        <div id="navbar-content" class:hidden={!navbar_open} class="absolute md:static top-16 left-0 right-0 md:flex bg-base-100 shadow-sm md:shadow-none z-10 md:z-auto p-4 md:p-0">
            <ul class="menu menu-horizontal px-1">
                {#each navItems as item}
                    {#if (!item.requiresAuth || $is_user) && (!item.requiresDebug || $debug)}
                        <li>
                            <a 
                                href={item.href} 
                                class:active={segment === item.segment}
                                on:click={() => {
                                    if (window.innerWidth < 768) {
                                        navbar_open = false;
                                    }
                                }}
                            >
                                {item.label}
                            </a>
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
    </div>
    
    <!-- User dropdown menu -->
    <div class="flex-none flex items-center gap-2">
        <a href="/add_campaign" class="btn btn-primary btn-sm hidden sm:inline-flex">+ Start a campaign</a>
        <div class="dropdown dropdown-end user-dropdown">
            <label tabindex="0" class="btn btn-ghost px-2">
                {#if $is_user}
                    <span class="avatar-chip" aria-hidden="true">{($my_user.name || 'U').slice(0, 1).toUpperCase()}</span>
                    <span class="font-medium truncate max-w-[120px] hidden md:inline">
                        {$my_user.name || `You (ID ${$my_user.id})`}
                    </span>
                    {#if $my_user?.auth_debug} ({$my_user.auth_name}){/if}
                {:else}
                    <span class="font-medium">Account</span>
                {/if}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </label>
            
            <ul tabindex="0" 
                class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52 mt-4"
            >
                {#if $is_user}
                    <li><a href="/you">Profile</a></li>
                    <li><a href="/account">Account</a></li>
                    <li><a href="/notifications">Notifications</a></li>
                    <li><a href="/add_campaign">Add campaign</a></li>
                    <li><a href="/login">Verify identity</a></li>
                    <li class="divider"></li>
                    <li><button class="text-left w-full" on:click={toggle_settings}>Settings</button></li>
                    <li><button class="text-left w-full" on:click={handleLogout}>Logout</button></li>
                {:else}
                    <li><a href="/login">Login</a></li>
                    <li><button class="text-left w-full" on:click={() => create_user(false)}>New user</button></li>
                {/if}
            </ul>
        </div>
    </div>
</div>

<!-- Settings Modal -->
<SettingsModal isOpen={settingsModalOpen} on:close={closeSettingsModal} />
<TheNagModal />

<style>
    .brand {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        text-decoration: none;
        color: inherit;
        font-weight: 800;
        letter-spacing: -0.01em;
        padding: 0 0.25rem;
    }
    .brand-mark {
        color: var(--color-primary);
        font-size: 1.35rem;
        line-height: 1;
    }
    .brand-name {
        font-size: 1.1rem;
    }
    .avatar-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 9999px;
        background: color-mix(in oklab, var(--color-secondary) 18%, transparent);
        color: var(--color-secondary);
        font-weight: 700;
        font-size: 0.85rem;
    }

    /* Ensure dropdown menu stays above other content */
    :global(.dropdown-content) {
        z-index: 100;
    }

    /* Style active links */
    :global(.menu li a.active) {
        background-color: hsl(var(--p) / 0.2);
        color: hsl(var(--pc));
        font-weight: 500;
    }

    /* Add a divider in the dropdown */
    :global(.menu li.divider) {
        height: 1px;
        background-color: hsl(var(--b3));
        margin: 0.5rem 0;
    }

    /* Mobile menu styling */
    @media (max-width: 767px) {
        .navbar-content.hidden {
            display: none;
        }
    }
    
    /* Style dropdown buttons to match links */
    :global(.menu li button) {
        display: block;
        padding: 0.5rem 0.75rem;
        color: inherit;
        font-size: 0.875rem;
        border-radius: 0.25rem;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        width: 100%;
    }
    
    :global(.menu li button:hover) {
        background-color: hsl(var(--b2));
    }
</style>