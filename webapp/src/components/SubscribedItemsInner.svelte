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
