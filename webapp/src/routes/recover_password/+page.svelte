<script lang='js'>
  import { page } from '$app/stores';
  // Note: Need to implement or fix this auth import
  // import {auth} from "../utils/nhost.js"


  function nhost_change_password(){
    var form = document.getElementById("change_password_form");
    // Note: In SvelteKit 2, URL parameters are accessed differently
    // var ticket = $page.url.searchParams.get('ticket');
    var new_password = form?.new_password?.value;
    var repeat_password = form?.repeat_password?.value;
    if(new_password !== repeat_password){
      throw "Passwords don't match";
    }

    console.log("Password change functionality needs to be updated for SvelteKit 2");
    
    // Commented until auth module is fixed
    /*
    auth.confirmPasswordChange(new_password, ticket).then((value) => {
      console.log("confirm password change")
      console.log(value)
    })
    */
  }
</script>
<div class="form-container" id="change_password_form_container">
  <label class="form-header" for="change_password_form">Change password</label>
  <form class="standard-form" id="change_password_form" action="#" on:submit|preventDefault="{nhost_change_password}">
    <div class="form-inputs">
      <label for="password">New Password</label><input type="password" name="new_password" autocomplete="new-password"/>
      <label for="repeat_password">Repeat Password</label><input type="password" name="repeat_password" autocomplete="new-password"/>
    </div>
    <input type="submit" value="Submit"/>
  </form>
</div>
<style>

  .form-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  #change_password_form .form-inputs{
    grid-template-columns: repeat(3,1fr);
  }

  .form-inputs label{
    grid-column: 1/2
  }

  .form-inputs input{
    grid-column: 2/3
  }

  .form-header{
    font-weight: bold;
  }

</style>
