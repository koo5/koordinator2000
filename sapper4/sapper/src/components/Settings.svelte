<script type='js'>
	import {my_user} from 'srcs/my_user.js';
</script>

<h3>user settings</h3>
<p>
	hide_help:
	<input type="checkbox" bind:checked={$my_user.hide_help}>
	<br>
</p>

<h3>developer settings</h3>
<p>
	crash_debug:
	<input type="checkbox" bind:checked={$my_user.crash_debug}>
	<br>
	database_debug:
	<input type="checkbox" bind:checked={$my_user.database_debug}>
	<br>
	auth_debug:
	<input type="checkbox" bind:checked={$my_user.auth_debug}>
	<br>
	graphql_debug:
	<input type="checkbox" bind:checked={$my_user.graphql_debug}>
	<br>
</p>
