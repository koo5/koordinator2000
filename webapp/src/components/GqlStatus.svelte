<script lang="ts">
	import { setContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { my_user } from '../my_user.ts';

	// Defining the type for the status
	type GqlStatus = any[] | undefined;

	// Status displayer function type
	type StatusDisplayer = (new_status: GqlStatus) => void;

	let status: GqlStatus = undefined;

	$: status_string = (
		$my_user.graphql_debug
		? JSON.stringify(status, null, ' ')
		: (
			(status && (status[0] === "OK" || status[0] === "working.."))
				? status[0]
				: null
		)
	);

	// Set the context with the typed function
	setContext<StatusDisplayer>('graphql_status_displayer', (new_status) => {
		status = new_status;
		console.log(status);
	});
</script>

<style>
	pre {
		overflow-x: scroll;
		overflow-y: scroll;
		width: 300px;
		height: 300px;
		border-style: dotted;
		background-color: rgb(230, 230, 230);
		border-style: dotted;
	}
</style>

<slot>???</slot>
{#if status_string}
	{#if $my_user.database_debug}
		<pre transition:slide|local>action status:
			{status_string}
		</pre>
	{/if}
{/if}