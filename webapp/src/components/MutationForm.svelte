<script type='js'>

	import MutationSubmitForm from './MutationSubmitForm.svelte';
	export let css_ref = undefined;
	export let mutation;
	export let variables;

</script>

<MutationSubmitForm {css_ref} on:done {mutation} {variables}>
	<slot>???</slot>
</MutationSubmitForm>


