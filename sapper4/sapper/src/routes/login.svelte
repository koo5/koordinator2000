<script lang='js'>
  import {auth} from "srcs/utils/nhost.js"
  import Login from "cmps/Login.svelte"
  import Register from "cmps/Register.svelte"
  import ForgotPassword from "cmps/ForgotPassword.svelte"
  import LogoutButton from "cmps/LogoutButton.svelte"
  import ChangePassword from "cmps/ChangePassword.svelte"

  var _isLoggedIn
  auth.onAuthStateChanged((loggedIn) => {
    console.log("auth state changed!");
    console.log("> {loggedIn}")
    console.log({ loggedIn })
    console.log(loggedIn)
    _isLoggedIn = loggedIn
    console.log("> auth.isAuthenticated()")
    console.log(auth.isAuthenticated())
    console.log("> auth.getJWTToken()")
    console.log(auth.getJWTToken())
    console.log("> auth.getClaim('x-hasura-user-id')")
    console.log(auth.getClaim('x-hasura-user-id'))
    console.log("> auth.getClaim('x-hasura-default-role')")
    console.log(auth.getClaim('x-hasura-default-role'))
    console.log("> auth.getClaim('x-hasura-allowed-roles')")
    console.log(auth.getClaim('x-hasura-allowed-roles'))
  });

  $: isLoggedIn = _isLoggedIn
  /*
  Not implemented yet: https://docs.nhost.io/auth/api-reference#delete-user

  ON DELETE CASCADE for foreign keys on users table

  */
  function nhost_delete_user(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'https://backend-3f257037.nhost.app/auth/delete', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Delete done...")
        }
    }
    xhr.send("");
  }

</script>
{#if !isLoggedIn}
  <Login/>
  <ForgotPassword/>
  <Register/>
{:else}
  <LogoutButton/>
  <ChangePassword/>

  <div class="form-container" id="delete_form_container">
    <label class="form-header" for="delete">Delete User</label>
    <input type="button" value="Delete user" on:click="{nhost_delete_user}">
  </div>
{/if}


<style>

  .form-container {
    margin: 2em;
    padding: 1em;
    box-shadow: 0px 0px 40px -10px #e0e0e0;
    border-radius: 10px;
  }
  .form-header{
    font-weight: bold;
  }

  #delete_form_container{
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 1fr;
  }

  #delete_form_container label{
    grid-column: 1/2;
  }
  #delete_form_container input{
    grid-column: 2/3;
  }
</style>
