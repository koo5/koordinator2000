<script type='js'>
  import { onMount } from 'svelte';
  import { mutation } from 'svelte-apollo';
  import gql from 'graphql-tag';

  const ADD_USER = gql`
    mutation($name: String!, $email: String) {
      insert_accounts(objects: [{name: $name, email: $email}]) {
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
      mutation(mut);
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
  Add user:
  <label for="user-name">Name</label>
  <input type="text" id="user-name" bind:value={name} />
  <label for="user-email">E-mail</label>
  <input type="text" id="user-email" bind:value={email} />
  <button type="submit">Add User</button>
  <br>GraphQL status:<pre>{ status_string }</pre>
</form>
</div>
