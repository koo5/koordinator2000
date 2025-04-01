<script>

    export let result;

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
