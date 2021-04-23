<script>
import {auth} from "src/utils/nhost.js"

/*
https://docs.nhost.io/auth/email-templates#password-reset-email-template
https://nhost.github.io/hasura-backend-plus/api.html#change-password
https://nhost.github.io/hasura-backend-plus/api.html#change-password-request
https://nhost.github.io/hasura-backend-plus/api.html#change-password-change

environment variable: LOST_PASSWORD_ENABLE

*/
function nhost_forgot_password(){
  var form = document.getElementById("forgot_password_form")
  var email = form.email.value
  /*
  value = undefined
  */
  auth.requestPasswordChange(email).then((value) => {
    console.log("requested password change")
    console.log(value)
  })
}

</script>
<div class="form-container" id="forgot_password_form_container">
  <label class="form-header" for="forgot_password_form">Forgot password</label>
  <form class="standard-form" id="forgot_password_form" action="#" on:submit|preventDefault="{nhost_forgot_password}">
    <div class="form-inputs">
      <label for="email">E-Mail</label><input type="text" name="email"/>
    </div>
    <input type="submit" value="Send recovery email"/>
  </form>
</div>

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
.form-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  #forgot_password_form .form-inputs{
    grid-template-rows: repeat(1,1fr);
  }

</style>
