<script lang='js'>

  import {writable} from 'svelte/store';
  import {auth} from "src/utils/nhost.js"
  import Login from "src/components/Login.svelte"
  import Register from "src/components/Register.svelte"
  import ForgotPassword from "src/components/ForgotPassword.svelte"
  import LogoutButton from "src/components/LogoutButton.svelte"
  import ChangePassword from "src/components/ChangePassword.svelte"

  let nhost_auth_state = writable({});

  auth.onAuthStateChanged((loggedIn) =>
      {
        let claims = {}
        const claim_names = [ 'x-hasura-allowed-roles',
          'x-hasura-default-role',
          'x-hasura-user-id'
        ];
        claim_names.forEach((x) => claims[x] = auth.getClaim(x));

        let state = {
          loggedIn: loggedIn,
          isAuthenticated: auth.isAuthenticated(),
          JWTToken: auth.getJWTToken(),
          claims
        }
        console.log("auth state changing!\n" + JSON.stringify(state, null, ' '));
        nhost_auth_state.set(state);
      }
    );

</script>

<pre>
  {JSON.stringify($nhost_auth_state, null, ' ')}
</pre>

{#if !$nhost_auth_state.loggedIn}
  <Login/>
  <ForgotPassword/>
  <Register/>
{:else}
  <LogoutButton/>
  <ChangePassword/>
{/if}

