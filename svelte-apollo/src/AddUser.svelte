<script>
  import { onMount } from 'svelte';
  import { mutate } from 'svelte-apollo';
  import { client } from './apollo';
  import gql from 'graphql-tag';

  const ADD_USER = gql`
    mutation($name: String!, $email: String) {
      insert_users(objects: [{name: $name, email: $email}]) {
        affected_rows
      }
    }
  `;
  let status = 'ready';
  $:status_string = JSON.stringify(status,null,' ');

  let name = '';
  let email = 'user1@example.com';
  //export let userCache;

  onMount(async () => {
    clearForm()
  });

  function clearForm()
  {
    name = 'user' + Date.now();
  }

  async function addUser(e) {
    e.preventDefault();
    try {
      let mut = {
        mutation: ADD_USER,
        variables: { name, email }
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
<form on:submit={addUser}>
  <label for="user">User</label>
  <input type="text" id="user-name" bind:value={name} />
  <input type="text" id="user-email" bind:value={email} />
  <button type="submit">Add User</button>
  <br>status:<pre>{ status_string }</pre>
</form>
</div>
