<script lang="ts">
    import type { Readable } from 'svelte/store';

    // Match the subscription store result structure
    interface SubscriptionResult<T = any> {
        fetching: boolean;
        data?: T;
        error?: Error | null;
    }

    // Export items as a readable store with subscription result
    export let items: Readable<SubscriptionResult<any>>;
</script>

{#if $items.data}
    <!-- Always render data if available, regardless of fetching state -->
    <slot da={$items.data}>???</slot>
{:else if $items.error}
    <!-- Show error if there's an error and no data -->
    <pre>{JSON.stringify($items.error, null, '  ')}</pre>
{:else}
    <!-- Only show loading if no data and no error -->
    <div class="content_block">
        <div class="animate-flicker">Loading items...</div>
    </div>
{/if}

<details>
    <summary>Debug Info</summary>
    <pre>{JSON.stringify($items, null, 2)}</pre>
</details>
