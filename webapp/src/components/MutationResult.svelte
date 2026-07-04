<script lang="ts">
    import type { Readable } from 'svelte/store';
    
    interface MutationResultData {
        fetching: boolean;
        error?: Error;
        data?: any;
    }

    export let result: Readable<MutationResultData>;
</script>

{#if $result.fetching}
    <div class="content_block">
        <div class="animate-flicker">…</div>
    </div>
{:else if $result.error}
    <div class="alert alert-error my-2"><span>{$result.error.message}</span></div>
{/if}
<!-- On success, parents handle their own confirmation UI (via on:done). -->

