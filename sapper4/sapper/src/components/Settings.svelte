<script type='js'>
	import {my_user} from 'srcs/my_user.js';
</script>

<h3>user settings</h3>
<p>
	<label for="x1">hide_help:</label>
	<input id="x1" type="checkbox" bind:checked={$my_user.hide_help}>
	<br>
</p>

<h3>developer settings</h3>
<p>
	<label for="x2">crash_debug:</label>
	<input id="x2" type="checkbox" bind:checked={$my_user.crash_debug}>
	<br>
	<label for="x3">database_debug:</label>
	<input id="x3" type="checkbox" bind:checked={$my_user.database_debug}>
	<br>
	<label for="x4">auth_debug:</label>
	<input id="x4" type="checkbox" bind:checked={$my_user.auth_debug}>
	<br>
	<label for="x5">graphql_debug:</label>
	<input id="x5" type="checkbox" bind:checked={$my_user.graphql_debug}>
	<br>
</p>
