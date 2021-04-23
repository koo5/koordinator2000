<script>
import {auth} from "src/utils/nhost.js"

function nhost_login(){
  var form = document.getElementById("login_form");
  var email = form.email.value
  var password = form.password.value
  /*
  value : {
    session: {
      jwt_expires_in:
      jwt_token:
      refresh_token:
      user: ...
    },
    user: {
      id:
      display_name:
      email:
    }
  }
  */
  auth.login({email, password}).then(
    (value) => {
      console.log("logged in")
      console.log(value)
    },
    (reason) => {
      console.log("error")
      console.log(reason)
    }
  )
}
</script>
<div class="form-container" id="login_form_container">
  <label class="form-header" for="login_form">Login</label>
  <form class="standard-form" id="login_form" action="#" on:submit|preventDefault="{nhost_login}">
    <div class="form-inputs">
      <label for="email">E-Mail</label><input type="text" name="email"/>
      <label for="password">Password</label><input type="password" name="password"/>
    </div>
    <input type="submit" value="Log in"/>

  </form>
  <ul>
    <li>
      <a href="https://backend-3f257037.nhost.app/auth/providers/github">
        Sign in with Github
      </a>
    </li>
    <li>
      <a href="https://backend-3f257037.nhost.app/auth/providers/google">
        Sign in with Google
      </a>
    </li>
    <li>
      <a href="https://backend-3f257037.nhost.app/auth/providers/facebook">
        Sign in with Facebook
      </a>
    </li>
    <li>
      <a href="https://backend-3f257037.nhost.app/auth/providers/linkedin">
        Sign in with LinkedIn
      </a>
    </li>
  </ul>
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
  #login_form .form-inputs{
    grid-template-rows: repeat(2,1fr);
  }

</style>
