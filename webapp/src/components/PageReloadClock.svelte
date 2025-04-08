<script lang="ts">
    import { onMount } from 'svelte';
    import { my_user } from '$lib/client/my_user.ts';

    let timer = 0;
    onMount(() => {
        setInterval(() => {
            timer++;
        }, 1000);
    });
</script>

{#if $my_user.crash_debug}
    loaded {timer.toString()} seconds
{/if}
