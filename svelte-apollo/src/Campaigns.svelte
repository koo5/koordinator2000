<script>
  import gql from 'graphql-tag';
  import { client } from './apollo';
  import { subscribe } from 'svelte-apollo';
  import { my_user } from './my_user.js';
  import { MyParticipation } from './MyParticipation.svelte';


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




<style>
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: yellow;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>

<button class="button" on:click={() => {console.log(campaignList)}}>Click</button>


<ul>
  {#await $campaignList}
    <li>Loading...</li>
  {:then result}
    {#each result.data.campaigns as campaign (campaign.id)}

      <li><h4>{campaign.id} - {campaign.title}</h4></li>
      <p>{campaign.description}</p>

      <b>participate:</b>
      <MyParticipation campaign={campaign}>
      </MyParticipation>

      <b>participants:</b>
      {#each campaign.participations as participation (participation.id)}
        <span class='tooltip'>{participation.user.name}
          <span class="tooltiptext">user id:{participation.user.id}</span>
        </span>
        (
        <span class='tooltip'>{participation.threshold}
          <span class="tooltiptext">participation id:{participation.id}</span>
        </span>
        )
      {/each}

    {:else}
      <li>No campaigns found</li>
    {/each}
  {:catch error}
    <li>Error loading campaigns: {error}</li>
  {/await}
</ul>

