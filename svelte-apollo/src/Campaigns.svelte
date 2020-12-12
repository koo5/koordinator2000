<script>
  import gql from 'graphql-tag';
  import { client } from './apollo';
  import { subscribe } from 'svelte-apollo';
  import Campaign from './Campaign.svelte';

  const CAMPAIGN_LIST = gql`
    subscription {
      campaigns(order_by: [{id: asc}]) {
        id,
        title,
        description,
        participations(order_by: [{threshold: asc}]) {
          id
          threshold
          user {
            id
            name
          }
        }
      }
    }
  `;

  const campaignList = subscribe(client, { query: CAMPAIGN_LIST })

</script>

<ul>
  {#await $campaignList}
    <li>Loading...</li>
  {:then result}
    {#each result.data.campaigns as campaign (campaign.id)}
      <Campaign {campaign} />
    {:else}
      <li>No campaigns found</li>
    {/each}
  {:catch error}
    <li>Error loading campaigns: {error}</li>
  {/await}
</ul>

