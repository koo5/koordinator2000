<script type='js'>
  import SubscribedItemsInner from 'cmps/SubscribedItemsInner.svelte';
  import { my_user } from 'srcs/my_user.js';

  export let items;
  let data;

</script>

{#if $my_user.graphql_debug}
  <pre>{JSON.stringify(items, null, '  ')}</pre>
  <pre>{JSON.stringify(typeof items, null, '  ')}</pre>
{/if}
<SubscribedItemsInner {items}><slot>???</slot></SubscribedItemsInner>
