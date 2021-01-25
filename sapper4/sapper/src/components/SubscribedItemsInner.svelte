<script type='js'>

	export let items;

</script>

{#if $items.loading}
	<li>Loading...
	<p>If it's not loading, you probably hit free demo <a href="http://hasura.io/">Hasura</a> limit. Please reload after a while.</p>
	</li>
{:else if $items.data}
	<slot da={($items.data)}>???</slot>
{:else}
	<pre>{JSON.stringify($items.error, null, '  ')}</pre>
{/if}
