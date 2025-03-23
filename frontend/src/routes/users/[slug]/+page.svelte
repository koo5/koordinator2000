<script>
  import User from '../../../components/User.svelte';
  export let data;
  const user_id = data.user_id;
</script>

<User user_id={user_id}/>