<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { my_user, type MyUser } from '$lib/client/my_user';
    import type { SharedStore } from '$lib/client/svelte-shared-store';
    
    import { browser } from '$app/environment';

    // This page is just a bridge to set localStorage and redirect
    onMount(() => {
        if (!browser) return;
        
        const searchParams = new URLSearchParams(window.location.search);
        const userDataParam = searchParams.get('userData');
        const returnTo = searchParams.get('returnTo') || '/';
        
        if (userDataParam) {
            try {
                // Parse and set the user data in localStorage
                const userData = JSON.parse(decodeURIComponent(userDataParam));
                (my_user as SharedStore<MyUser>).set(userData);
                
                // Redirect to the target page
                goto(decodeURIComponent(returnTo));
            } catch (error) {
                console.error('Error setting user data:', error);
                goto('/?auth_error=true');
            }
        } else {
            console.error('No user data provided');
            goto('/?auth_error=true');
        }
    });
</script>

<div class="loading-container">
    <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-3">Setting up your session...</p>
</div>

<style>
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
    }
</style>