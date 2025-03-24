<script>
import {auth} from "../utils/nhost.js"

function nhost_change_password(){
  var form = document.getElementById("change_password_form")
  var old_password = form.old_password.value
  var new_password = form.new_password.value
  var repeat_password = form.repeat_password.value
  if(new_password != repeat_password){
    throw "Passwords don't match"
  }
  /*
  value = undefined
  */
  auth.changePassword(old_password, new_password).then((value) => {
    console.log("changed password")
    console.log(value)
  })
}

</script>
<div class="form-container" id="change_password_form_container">
  <label class="form-header" for="change_password_form">Change password</label>
  <form class="standard-form" id="change_password_form" on:submit|preventDefault="{nhost_change_password}">
    <div class="form-inputs">
      <label for="old_password">Current password</label><input type="password" name="old_password" autocomplete="new-password"/>
      <label for="new_password">New password</label><input type="password" name="new_password" autocomplete="new-password"/>
      <label for="repeat_password">Repeat new password</label><input type="password" name="repeat_password" autocomplete="new-password"/>
    </div>
    <input type="submit" value="Change password"/>
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

#change_password_form .form-inputs {
  grid-template-rows: repeat(3,1fr)
}
</style>
