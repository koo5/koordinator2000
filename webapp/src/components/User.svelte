<script>
  import {subscribe, gql} from "$lib/apollo.js";

  $: account_subscription = subscribe(
    gql`
    subscription ($user_id: Int!) {
      accounts(where: {id: {_eq: $user_id}}){
        id,
        name,
        email
      }
    }
      `,
    {
      variables: {
        user_id
      }
    }
  );

  export let user_id;


</script>

  <h5>account</h5>
  <div class="content_block">
  account ID: {user_id}
  <br>
  {#if $account_subscription.loading}
  Loading account data...
  {:else if $account_subscription.data}
  Name: {$account_subscription.data.accounts[0].name}
  <br>
  e-mail: {$account_subscription.data.accounts[0].email}
  {/if}
  </div>
