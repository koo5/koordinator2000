<script context="module">
	import _ from 'underscore';

	export async function preload(page)
	{
    console.log("user slug preload");
		const {slug} = page.params;
		if (parseInt(slug) >= 0)
		{
			const user_id = slug;
			console.log(user_id);
			return {user_id};
		}
	}
</script>
<script>
  import User from '../../components/User.svelte';

  export let user_id;

</script>
<User user_id={user_id}/>
