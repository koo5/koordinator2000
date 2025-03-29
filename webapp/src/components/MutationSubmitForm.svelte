<script lang="ts">
	import { mutation as urqlMutation } from '$lib/urql.ts';
	import { getContext } from 'svelte';
	import { ensure_we_exist, apply_newly_authenticated_user, my_user, type AuthUserResponse } from '../my_user.ts';
	import { createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import type { DocumentNode } from 'graphql';
	
	// Type for GraphQL mutation function
	type MutationFunction = (options: { variables: Record<string, any> }) => Promise<any>;
	
	// Type for status displayer context
	type StatusDisplayer = (message: any[]) => void;
	
	// Define the event dispatcher types
	interface MutationEvents {
		done: any; // The result of the mutation
	}
	
	const dispatch = createEventDispatcher<MutationEvents>();

	export let css_ref: string | undefined = undefined;
	export let mutation: DocumentNode;
	export let variables: Record<string, any>;
	
	$: mutation2 = browser ? urqlMutation(mutation) : undefined;
	let status_displayer = getContext<StatusDisplayer>('graphql_status_displayer');
	$: variables_str = JSON.stringify(variables, null, ' ');

	async function submit(): Promise<void> {
		status_displayer(['MUTATE:', mutation2]);
		let newly_authenticated_user: AuthUserResponse | null = null;
		
		try {
			newly_authenticated_user = await ensure_we_exist();
		} catch (e) {
			status_displayer(["err", e]);
		}
		
		let a_fucking_error: Error | undefined;
		let result1: Promise<any> | undefined;
		let result2: any;
		
		try {
			if (newly_authenticated_user != null) {
				if (variables.user_id !== undefined) {
					variables.user_id = newly_authenticated_user.id;
				}
			}
			
			status_displayer(['vars..', variables]);
			// Only execute if mutation2 is defined (we're in the browser)
			if (mutation2) {
				result1 = mutation2({variables: variables});
				status_displayer(['result1...', result1]);
				result2 = await result1;
			}
		} catch (error) {
			console.log(error);
			a_fucking_error = error as Error;
			status_displayer(['ERROR:', error]);
		}
		
		if (!a_fucking_error && result2) {
			status_displayer(['OK', result2]);
			dispatch('done', result2);
		}
		
		if (newly_authenticated_user != null) {
			apply_newly_authenticated_user(newly_authenticated_user);
		}
	}
</script>

<form on:submit|preventDefault={submit} class={css_ref}>
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