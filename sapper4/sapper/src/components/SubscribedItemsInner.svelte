<script type='js'>

	export let items;

</script>

{#if $items.loading}
	<li>
		<div class="animate-flicker">Loading...</div>
	<p>If it doesn't load, maybe it crashed or you hit our free demo <a href="http://hasura.io/">Hasura</a> limit. Please try again in a minute.</p>
	</li>
{:else if $items.data}
	<slot da={($items.data)}>???</slot>
{:else}
	<pre>{JSON.stringify($items.error, null, '  ')}</pre>
{/if}
