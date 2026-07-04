<script lang="ts">
    import { getContextClient, mutationStore } from '@urql/svelte';
    import { my_user } from '$lib/client/my_user.ts';
    import { createEventDispatcher } from 'svelte';
    import type { DocumentNode } from 'graphql';
    import MutationResult from "./MutationResult.svelte";
    import { getUserRoleClient } from "$lib/urql.ts";

    // Type for status displayer context
    type StatusDisplayer = (message: any[]) => void;

    // Define the event dispatcher types
    interface MutationEvents {
        done: any; // The result of the mutation
    }

    const dispatch = createEventDispatcher<MutationEvents>();

    export let css_ref: string | undefined = undefined;
    export let variables: Record<string, any>;
    export let mutation: DocumentNode;

    $: variables_str = JSON.stringify(variables, null, ' ');

    let result;
    let client = getUserRoleClient();
    let dispatched = false;

    async function submit(): Promise<void> {
        console.log('submit', variables);
        dispatched = false;
        result = mutationStore({ client, query: mutation, variables });
    }

    // Forward the settled mutation result to parents via on:done (once per
    // submit). The result store stays `fetching` until the request resolves.
    $: if (result && !$result.fetching && !dispatched) {
        dispatched = true;
        dispatch('done', $result);
    }
</script>

{#if result}
    <MutationResult
        {result} />
{/if}

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
        display: inline-block;
    }
</style>
