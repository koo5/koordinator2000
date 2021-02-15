<script type='js'>
	import {my_user, default_participations_display_style} from 'srcs/my_user.js';
	const default_participations_display_styles_list = ['koo1','koo1_introductory','facebook','tabular_breakdown'];
</script>

<h3>user settings</h3>
<br>
	<label for="x1">hide_help:</label>
	<input id="x1" type="checkbox" bind:checked={$my_user.hide_help}>

<br>
	<label for="x1b">enable_swiping_on_desktop (TODO):</label>
	<input id="x1b" type="checkbox" bind:checked={$my_user.enable_swiping_on_desktop}>

	<h4>default_participations_display_style:</h4>
	{#each default_participations_display_styles_list as s (s)}
		<label>
			<input type=radio bind:group={$my_user.default_participations_display_style} value={s}>
			{s}
		</label>
		<br>
	{/each}
<br>

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
