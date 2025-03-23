<script type='js'>

	import {mutation as apollo_mutation} from 'svelte-apollo';
	import {getContext} from 'svelte';
	import {ensure_we_exist, apply_newly_authenticated_user, my_user} from '../my_user.js';
	import {createEventDispatcher} from 'svelte';
	import {browser} from '$app/environment';
	const dispatch = createEventDispatcher();

	export let css_ref;
	export let mutation;
	export let variables;
	$: mutation2 = browser ? apollo_mutation(mutation) : 123;
	let status_displayer = getContext('graphql_status_displayer');
	$: variables_str = JSON.stringify(variables, null, ' ');

	async function submit()
	{
		status_displayer(['MUTATE:', mutation2]);
		let newly_authenticated_user;
		try
		{
			newly_authenticated_user = await ensure_we_exist();
		} catch (e)
		{
			status_displayer(["err", e]);
		}
		var a_fucking_error;
		var result1;
		var result2;
		try
		{
			if (newly_authenticated_user != null)
			{
				if (variables.user_id != undefined)
					variables.user_id = newly_authenticated_user.id;
			}
			status_displayer(['vars..', variables]);
			result1 = mutation2({variables: variables});
			status_displayer(['result1...', result1]);
			result2 = await result1;
		} catch (error)
		{
			console.log(error);
			a_fucking_error = error;
			status_displayer(['ERROR:', error]);
		}
		if (!a_fucking_error)
		{
			status_displayer(['OK', result2]);
			dispatch('done', result2);
		}
		if (newly_authenticated_user != null)
			apply_newly_authenticated_user(newly_authenticated_user);
	}

</script>

<form {css_ref} on:submit|preventDefault={submit}>
	{#if $my_user.graphql_debug}
		<pre>mutation vars:{variables_str}</pre>
	{/if}
	<slot>???</slot>
</form>


<style>
	pre {
		border-style: dotted;
		background-color: rgb(230, 230, 230);
	}

	form {
		background-color: rgb(250, 250, 230);
		display: inline-block
	}

</style>
