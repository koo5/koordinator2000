<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { apply_newly_authenticated_user } from '$lib/client/my_user';

    export let data: { user?: App.UserObject };

    let status = 'Signing you in…';

    onMount(async () => {
        if (data?.user && data.user.id > 0) {
            await apply_newly_authenticated_user(data.user);
            status = 'Signed in! Redirecting…';
        } else {
            status = 'Sign-in could not be completed.';
        }
        setTimeout(() => goto('/'), 500);
    });
</script>

<div class="content_block">
    <p>{status}</p>
</div>
