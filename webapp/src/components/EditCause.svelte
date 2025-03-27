<script type='js'>

  import FirepadEditor from './FirepadEditor.svelte';
  import gql from 'graphql-tag';

  export let id;
  let title;
  let description;
  let status_string;

  function save()
  {

  }

</script>



<form on:submit={save}>
  <h3>Edit Cause:</h3>
  <label for="title">Title:<br></label>
  <input type="text" id="title" bind:value={title}/>
  <br>
  <label for="description">Description:<br></label>
  <FirepadEditor uid={id}/>

  <button type="submit">Save</button>
  <br>GraphQL status:
  <pre>{ status_string }</pre>
</form>
