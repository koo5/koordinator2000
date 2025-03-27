<script type='js'>
	import {my_user, default_participations_display_style} from '../my_user.js';

	const default_participations_display_styles_list = ['koo1', 'koo1_introductory', 'facebook', 'tabular_breakdown'];


</script>
<div>
	<h5>general</h5>
	<label><input type="checkbox" bind:checked={$my_user.autoscroll}>Autoscroll</label>
	<br>
	<label><input type="checkbox" bind:checked={$my_user.hide_help}>Hide help</label>
	<br>
	<label><input type="checkbox" bind:checked={$my_user.enable_swiping_also_on_desktop}>enable_swiping_also_on_desktop
		(TODO)</label>
	<br>
	<h5>default display style for participations</h5>
	{#each default_participations_display_styles_list as s (s)}
		<label>
			<input type=radio bind:group={$my_user.default_participations_display_style} value={s}>
			{s}
		</label>
		<br>
	{/each}

	<h5>color theme</h5>

	<label>
		<input type="checkbox" bind:checked={$my_user.override_browser_setting}/>
		override browser setting
	</label>
	<br>

	<label>
		<input type="checkbox" bind:checked={$my_user.invert}/>
		invert light/dark
	</label>
	<br>
	<label>
		hue-rotate (deg):
		<input type="number" step="1" min="-9999999999" max="9999999999" bind:value={$my_user.hue_rotate}/>
	</label>
	<br>
	<label>
		saturate (%):
		<input type="number" min="-100" max="100" step="10" bind:value={$my_user.saturate}/>
	</label>
	<br>
	<label>
		contrast (%):
		<input type="number" min="-80" max="100" step="10" bind:value={$my_user.contrast}/>
	</label>
	<br>


	<h5>developer settings</h5>
	<label>
		<input type="checkbox" bind:checked={$my_user.crash_debug}>
		crash_debug</label>
	<br>
	<label>
		<input type="checkbox" bind:checked={$my_user.database_debug}>
		database_debug</label>
	<br>
	<label>
		<input type="checkbox" bind:checked={$my_user.auth_debug}>
		auth_debug:</label>
	<br>
	<label>
		<input type="checkbox" bind:checked={$my_user.graphql_debug}>
		graphql_debug:</label>
	<br>
</div>

<style>
	/*div
	{
		margin-bottom: 0px;
		margin-top: 0px;
    }*/

</style>
