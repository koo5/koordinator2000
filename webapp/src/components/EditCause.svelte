<script lang='ts'>
	import FirepadEditor from './FirepadEditor.svelte';
	import gql from 'graphql-tag';

	export let id: string;
	let title: string = '';
	let description: string = '';
	let status_string: string = '';

	function save(): void {
		// Placeholder for save functionality
	}
</script>

<form on:submit|preventDefault={save}>
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
