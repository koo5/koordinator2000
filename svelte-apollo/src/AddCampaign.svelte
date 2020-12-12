<script>
  import { onMount } from 'svelte';
  import { mutate } from 'svelte-apollo';
  import { client } from './apollo';
  import gql from 'graphql-tag';
	import {my_user} from './my_user.js';

  const ADD = gql`
	mutation MyMutation($description: String = "", $maintainer_id: Int, $title: String = "") {
	  insert_campaigns(objects: {description: $description, maintainer_id: $maintainer_id, title: $title}) {
		affected_rows
	  }
	}
  `;
  let status = 'ready';
  $:status_string = JSON.stringify(status,null,' ');

  let title = '';
  let description = '';

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
        variables: { title, description, maintainer_id: my_user.id}
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
  <button type="submit">Add Campaign</button>
  <br>GraphQL status:<pre>{ status_string }</pre>
</form>
</div>
