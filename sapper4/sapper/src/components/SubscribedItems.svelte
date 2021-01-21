<script type='js'>
	import SubscribedItemsInner from 'cmps/SubscribedItemsInner.svelte';
	import { my_user } from 'srcs/my_user.js';

	export let items;
	let data;
	//$: console.log([items]);
	//$: items != null ? items.subscribe((x) => {data = x}) : null;
	//$: data = items ? $items.data : null;

/*	$: items != null ? sss(items) : null;
	function sss(items)
	{
		return items.subscribe((x) => {data = x});
	}*/


</script>

	{#if $my_user.graphql_debug}
		<pre>{JSON.stringify(items, null, '  ')}</pre>
		<pre>{JSON.stringify(typeof items, null, '  ')}</pre>
	{/if}
<SubscribedItemsInner {items}><slot>???</slot></SubscribedItemsInner>
