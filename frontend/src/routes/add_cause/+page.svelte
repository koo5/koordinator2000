<script>
	import MutationForm from '../../components/MutationForm.svelte';
	import gql from 'graphql-tag';
	import {my_user} from '../../my_user.js';
	import { goto } from '$app/navigation';

</script>

Multiple campaigns can be grouped under one cause.

Before starting to fill in data, you may want to register, so that your data may not become orphaned.

<MutationForm
	mutation={gql`
		mutation MyMutation($maintainer_id: Int) {
			insert_causes_one(object: {maintainer_id: $maintainer_id}) {
				id
			}
		}
	`}
	variables={{
		maintainer_id: $my_user.id,
	}}
	on:done={(result)=>{
		console.log(result);
		goto('/edit_cause/'+result["detail"]["data"]["insert_causes_one"]["id"]);
	}}
>
	<button type="submit">Add Cause</button>
</MutationForm>

