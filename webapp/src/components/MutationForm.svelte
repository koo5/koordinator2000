<script lang="ts">
    import MutationSubmitForm from './MutationSubmitForm.svelte';
    import type { DocumentNode } from 'graphql';

    export let css_ref: string | undefined = undefined;
    export let mutation: DocumentNode;
    export let variables: Record<string, any>;
</script>

<MutationSubmitForm {css_ref} on:done {mutation} {variables}>
    <slot>???</slot>
</MutationSubmitForm>
