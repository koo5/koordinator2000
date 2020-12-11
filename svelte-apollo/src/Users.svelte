<script context="module">
  import gql from 'graphql-tag';
  import { client } from './apollo';

  import { subscribe } from 'svelte-apollo';

  const USER_LIST = gql`
    subscription {
      users(order_by: [{id: asc}]) {
        id,
        name,
        email
      }
    }
  `;
  const userList = subscribe(client, { query: USER_LIST });
</script>

<ul>
  {#await $userList}
    <li>Loading...</li>
  {:then result}
    {#each result.data.users as user (user.id)}
      <li>{user.id} - {user.name} - {user.email}</li>
    {:else}
      <li>No users found</li>
    {/each}
  {:catch error}
    <li>Error loading users: {error}</li>
  {/await}
</ul>

