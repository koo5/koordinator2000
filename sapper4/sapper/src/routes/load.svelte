<script>
	import {my_user} from 'srcs/my_user.js';
	import gql from 'graphql-tag';
	import {FormGroup, Label} from 'sveltestrap';
	import MutationForm from 'cmps/MutationForm.svelte';

	let files;
	$: file = files?.[0];

	async function load(file)
	{
		var i = 0;
		let result = []
		JSON.parse(await file.text()).forEach(o =>
		{
			i++;
			if (!o.uri)
				o.uri = file.name + "#" + i;
			result.push(load_o(o));
		});
		return result;
	}

	function load_o(o)
	{
		let r = {};
		r.description = o?.description;
		r.title = o?.title;
		r.uri = o?.uri;
		return r;
	}

	let UPSERT = gql`
		mutation MyMutation($objects: [campaigns_insert_input!]! = {}, $update_columns: [campaigns_update_column!]! = cause_id) {
		  insert_campaigns(objects: $objects, on_conflict: {constraint: campaigns_uri_key, update_columns: $update_columns}) {
			affected_rows
		  }
		}
	`;

	let objects;
	$: file ? load(file).then(x => objects = x) : objects = [];
	$: vars = {
		objects,
		"update_columns": ["description", "smazano", "stealth", "suggested_highest_threshold", "suggested_lowest_threshold", "suggested_optimal_threshold", "title"]
	};


</script>
<h1>bulk campaign import</h1>
<FormGroup>
	<Label>Causes JSON file:
		<input type="file" bind:files>
	</Label>
</FormGroup>

<MutationForm mutation={UPSERT} variables={vars}>
	<button type="submit">Submit</button>
	<br>
</MutationForm>

