<script>
	import { client } from './apollo';
    import gql from 'graphql-tag';
    import { subscribe } from 'svelte-apollo';
	import Campaign from './Campaign.svelte';


  const causeList = subscribe(client, { query:
	  gql`
		subscription {
		  causes(order_by: [{id: asc}]) {
			id,
			title,
			description,
		  }
		}
	  `
  })

</script>



<ul>
  {#await $causeList}
    <li>Loading...</li>
  {:then result}
    {#each result.data.causes as cause (cause.id)}

      <li><h4>{cause.id} - {cause.title}</h4></li>
      <p>{cause.description}</p>

      {#each cause.campaigns as campaign (campaign.id)}
		  <Campaign id:campaign.id />
      {/each}

    {:else}
      <li>No causes found</li>
    {/each}
  {:catch error}
    <li>Error loading causes: {error}</li>
  {/await}
</ul>


