<script type='js'>
	export let items;
</script>

{#if $items.fetching}
	<div class="content_block">
		<div class="animate-flicker">
			Loading items...
		</div>
		SubscribedItemsInner:{JSON.stringify($items, null, '  ')}
		<p>If it doesn't load, maybe it crashed, or maybe you overloaded our <a href="http://nhost.io">DB hosting!</a>.
			Please try again in a minute.</p>
			<a href="/about">Come chat.</a>
	</div>
{:else if $items.data}
	<slot da={($items.data)}>???</slot>
{:else}
	<pre>{JSON.stringify($items.error, null, '  ')}</pre>
{/if}
