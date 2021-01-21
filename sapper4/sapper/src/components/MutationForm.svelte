<script type='js'>

	import GqlStatus from 'cmps/GqlStatus.svelte';
	import MutationSubmitForm from 'cmps/MutationSubmitForm.svelte';

	export let css_ref = undefined;
	export let mutation;
	export let variables;

</script>


<GqlStatus>
	<MutationSubmitForm {css_ref} on:done {mutation} {variables}>
		<slot>???</slot>
	</MutationSubmitForm>
</GqlStatus>


