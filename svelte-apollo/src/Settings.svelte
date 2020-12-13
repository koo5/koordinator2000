<script>
	import {ui_mode} from './settings';

</script>

<form on:submit|preventDefault={console.log}>
	<label for="ui_mode">UI mode:
		<select name="ui_mode" id="ui_mode">
		  <option value="introductory">Introductory</option>
		  <option value="compact">Compact</option>
		  <option value="mercedes">Mercedes</option>
		  <option value="audi">Audi</option>
		</select>

	</label>
</form>
