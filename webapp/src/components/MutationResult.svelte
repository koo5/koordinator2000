<script lang="ts">
    import type { Readable } from 'svelte/store';
    
    interface MutationResultData {
        fetching: boolean;
        error?: Error;
        data?: any;
    }

    export let result: Readable<MutationResultData>;

    result.subscribe((value) => {
        console.log('MutationResult', value);
    });

</script>

{#if $result.fetching}
    <div class="content_block">
        <div class="animate-flicker">Loading...</div>
    </div>
{:else if $result.error}
    error:<pre>{JSON.stringify($result.error, null, '  ')}</pre>
{:else}
    success={$result.data}>
{/if}
