<script lang='ts'>
  import { onMount } from 'svelte';
  import { mutation } from '$lib/urql.ts';
  import gql from 'graphql-tag';
  import type { DocumentNode } from 'graphql';

  const ADD_USER = gql`
    mutation($name: String!, $email: String) {
      insert_accounts(objects: [{name: $name, email: $email}]) {
        affected_rows
      }
    }
  `;
  
  interface MutationOptions {
    mutation: DocumentNode;
    variables: { name: string; email: string; };
  }
  
  let status: string | MutationOptions = 'ready';
  $:status_string = JSON.stringify(status,null,' ');

  let name = '';
  let email = 'user1@example.com';
  //export let userCache;

  onMount(async () => {
    clearForm()
  });

  function clearForm(): void {
    name = 'user' + Date.now();
  }

  async function addUser(e: Event): Promise<void> {
    e.preventDefault();
    try {
      const mut: MutationOptions = {
        mutation: ADD_USER,
        variables: { name, email }
      };
      status = mut;
      await mutation(ADD_USER)({ name, email });
      status = "Added successfully";
      clearForm()
    } catch(error) {
      console.error(error);
      status = error instanceof Error ? error.message : String(error);
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
