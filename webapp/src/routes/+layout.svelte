<script lang="ts">
    import '../app.css'; // Import Tailwind CSS
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    // No longer need Bootstrap components
    import Header from '../components/Header.svelte';
    import { createUrqlClient, setContextClient } from '$lib/urql.ts';
    import {
        apply_newly_authenticated_user,
        auth_event,
        type AuthEvent,
        create_user,
        my_user,
        type MyUser
    } from '$lib/client/my_user.ts';
    import { saturate_computate, set_css_var } from '$lib/client/campaign.ts';
    import { initVersionCheck } from '$lib/version-check.ts';
    import { get } from 'svelte/store';
    import { type SharedStore } from '$lib/client/svelte-shared-store.ts';
    import { debug } from '$lib/stores.ts';

    // Define types for layout data
    interface LayoutData {
        session?: {
            PUBLIC_URL?: string;
            [key: string]: any;
        };

        [key: string]: any;
    }

    export let data: LayoutData;

    $: PUBLIC_URL = data.session?.PUBLIC_URL || '';
    const callback_url = PUBLIC_URL + '/you';
    const logout_url = PUBLIC_URL + '/you';

    const urqlClient = createUrqlClient();
    setContextClient(urqlClient);

    // Auth0 token handling
    //$: maybe_ping_server_about_this($idToken, $userInfo);

    async function maybe_ping_server_about_this(token: string | null, info: any): Promise<void> {
        if (!browser) return;

        const auth = { auth0: { token, info } };

        // Need to cast to the correct type since we're in the browser
        const writableMyUser = my_user as SharedStore<MyUser>;
        writableMyUser.update((u: MyUser) => {
            return { ...u, auth };
        });

        // Create a proper AuthEvent
        const authEventData: AuthEvent = {
            type: 'auth0',
            ...get(my_user),
        };

        const event_result = await auth_event(authEventData);
        if (event_result && event_result.user) {
            console.log('ich bin logged in');
            writableMyUser.set(event_result.user);
        }
    }

    // Theme setting variables
    $: color_theme_hue_rotate = $my_user.hue_rotate;
    $: color_theme_saturate = $my_user.saturate;
    $: color_theme_invert = $my_user.invert;
    $: color_theme_contrast = $my_user.contrast;

    // Set CSS variables for theming
    $: set_css_var('--hue_rotate', (color_theme_invert ? 180 : 0) + (color_theme_hue_rotate || 0) + 'deg');
    $: set_css_var('--saturate', saturate_computate(color_theme_saturate));
    $: set_css_var('--invert', (color_theme_invert ? 100 : 0) + '%');
    $: set_css_var('--contrast', 100 + (color_theme_contrast || 0) + '%');

    // Settings modal state and toggle function
    let settingsModalOpen = false;

    function toggle_settings(): void {
        settingsModalOpen = !settingsModalOpen;
    }

    // Import JWT renewal service
    import { startJwtRenewalService } from '$lib/client/jwt-renewal';

    // Handle any client-side initialization
    onMount(async () => {
        await create_user(true);
        // Verify SvelteKit versions
        initVersionCheck();

        // Start JWT renewal service
        startJwtRenewalService();

        console.log('SvelteKit app mounted');
    });


    async function onkeydown(event) {
        //console.log('window onkeydown: ', event);
        if (event.ctrlKey && (event.key === '`' || event.key === '~' || event.key === ';')) debug.update(d => !d);
        console.log('debug: ', get(debug));
    }

</script>
<svelte:window on:keydown={onkeydown} />
<svelte:head>
    <!-- Note: CodeMirror script is loaded in app.html -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/firepad@1.5.9/dist/firepad.css" />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="container mx-auto px-4">
    <Header />
    <main class="py-4">
        <slot></slot>
    </main>
</div>

<style>
    :root {
        --primary-color: #ff3e00;
        --background-color: white;
        --text-color: #333;
    }

    /* Removed unused .app selector */

    main {
        position: relative;
        margin: 0 auto;
        box-sizing: border-box;
        flex: 1;
    }

    @keyframes loading {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    :global(#sapper) {
        background-color: #ffeeee;
    }

    :global(html) {
        margin: 0 auto;
        background-color: #ffeeee;
        filter: hue-rotate(var(--hue_rotate)) contrast(var(--contrast)) invert(var(--invert)) saturate(var(--saturate));
        height: 100%;
    }

    :global(.navbar) {
        background: #ffffee !important;
        margin: 0 0;
    }

    :global(.content_block) {
        margin: 0;
        max-width: 60rem;
        padding: 0;
        background: #ffffee;
    }

    :global(h1, h2, h3, h4, h5) {
        background: #eee;
    }

    @keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @-o-keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @-moz-keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @-webkit-keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    :global(.animate-flicker) {
        -webkit-animation: flickerAnimation 1s infinite;
        -moz-animation: flickerAnimation 1s infinite;
        -o-animation: flickerAnimation 1s infinite;
        animation: flickerAnimation 1s infinite;
    }

    :global(.dev) {
        border-style: dotted;
        background-color: rgb(230, 230, 230);
    }
</style>
