<script>
import {auth} from "src/utils/nhost.js"

function nhost_register(){
  var form = document.getElementById("register_form")
  var email = form.email.value
  var password = form.password.value
  var repeat = form.repeat_password.value
  if(password !== repeat){
    throw "Passwords don't match"
  }
  /*
  value = {
    session: null,
    user: {
      id
      display_name
      email
    }
  }
  */
  auth.register({email, password}).then(
    (value) => {
      console.log("registered")
      console.log(value)
    },
    (error) => {
      console.log("error")
      console.log(error)
    }
  )
}
</script>
<div class="form-container" id="register_form_container">
  <label class="form-header" for="register_form">Register</label>
  <form class="standard-form" id="register_form" on:submit|preventDefault="{nhost_register}">
    <div class="form-inputs">
      <label for="email">E-Mail</label><input type="text" name="email"/>
      <label for="password">Password</label><input type="password" name="password" autocomplete="new-password"/>
      <label for="repeat_password">Repeat Password</label><input type="password" name="repeat_password" autocomplete="new-password"/>
    </div>
    <input type="submit" value="Register"/>
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
  #register_form .form-inputs{
    grid-template-rows: repeat(3,1fr);
  }

</style>
