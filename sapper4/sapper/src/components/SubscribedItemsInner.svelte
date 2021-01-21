<script type='js'>

	export let items;

</script>

{#if $items.loading}
	<li>Loading...</li>
{:else if $items.data}
	<slot da={($items.data)}>???</slot>
{:else}
	<pre>{JSON.stringify($items.error, null, '  ')}</pre>
{/if}
