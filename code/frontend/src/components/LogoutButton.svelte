<script>
import {auth} from "src/utils/nhost.js"

function nhost_logout(){
  /*
  value = {
    session: null,
    user: null
  }
  */
  auth.logout().then(
    (value) => {
      console.log("logged out")
      console.log(value)
    },
    (error) => {
      console.log("error")
      console.log(error)
    }
  )
}

</script>
<div class="form-container" id="logout_form_container">
  <label class="form-header" for="logout">Log out</label>
  <input type="button" value="Log out" on:click="{nhost_logout}">
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

#logout_form_container{
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns:1fr 1fr;
}

#logout_form_container label{
  grid-column: 1/2;
}
#logout_form_container input{
  grid-column: 2/3;
}

</style>
