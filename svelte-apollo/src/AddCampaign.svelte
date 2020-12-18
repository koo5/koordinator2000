<script>
  import { onMount } from 'svelte';
  import { mutate } from 'svelte-apollo';
  import { client } from './apollo';
  import gql from 'graphql-tag';
	import {my_user} from './my_user.js';

  const ADD = gql`
	mutation MyMutation(
	  $description: String = "",
	  $maintainer_id: Int,
	  $title: String = "",
	  $suggested_lowest_threshold: bigint,
	  $suggested_highest_threshold: bigint,
  	  $suggested_optimal_threshold: bigint
	  ) {
	  insert_campaigns(objects: {
	    description: $description,
	    maintainer_id: $maintainer_id,
	    title: $title,
        suggested_lowest_threshold: $suggested_lowest_threshold,
	    suggested_highest_threshold: $suggested_highest_threshold,
  	    suggested_optimal_threshold: $suggested_optimal_threshold
	    }) {
		affected_rows
	  }
	}
  `;
  let status = 'ready';
  $:status_string = JSON.stringify(status,null,' ');

  let title = '';
  let description = '';

  let suggested_lowest_threshold = 8;
  let suggested_highest_threshold = 8000000000;
  let suggested_optimal_threshold = 800;

  onMount(async () => {
    clearForm()
  });

  function clearForm()
  {
	title = 'campaign' + Date.now();
	description = 'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ';
  }

  async function add(e) {
    e.preventDefault();
    try {
      let mut = {
        mutation: ADD,
        variables: {
          title,
          description,
          maintainer_id: my_user.id,
          suggested_lowest_threshold,
          suggested_highest_threshold,
          suggested_optimal_threshold
        }
      };
      status = mut;
      await mutate(client, mut);
      status = "Added successfully";
      clearForm()
    } catch(error) {
      console.error(error);
      status = error;
    }
  }
</script>

<style>
  div.dotted {border-style: dotted;}
</style>

<div class="dotted">
<form on:submit={add}>
  Add campaign:
  <label for="title">Title</label>
  <input type="text" id="title" bind:value={title} />
  <label for="description">Description</label>
  <input type="text" id="description" bind:value={description} />
  <label for="xxx">The lowest suggested threshold (the smallest number of people that should participate. Participating in a smaller number of people is expected to either bring no discernible effect, and/or to bring harm to the participants:</label>
  <input type="number" id="xxx" bind:value={suggested_lowest_threshold} />
  <label for="xxxx">The highest suggested threshold (the highest threshold that anyone should set. The number of participants is not expected to grow beyond it. For example: a campaign targetted at a local issue in a village of 160 people should suggest 160 or less):</label>
  <input type="number" id="xxxx" bind:value={suggested_highest_threshold} />
  <label for="xxxxx">Suggested threshold:</label>
  <input type="number" id="xxxxx" bind:value={suggested_optimal_threshold} />
  <button type="submit">Add Campaign</button>
  <br>GraphQL status:<pre>{ status_string }</pre>
</form>
</div>
