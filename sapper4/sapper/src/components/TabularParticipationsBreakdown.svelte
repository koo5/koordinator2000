<script>
	import {Table} from 'sveltestrap';
	import {get_status_class,get_tickmark} from 'srcs/stuff.js';
	export let campaign;
</script>
<table responsive>
	<thead>
	<tr>
		<th scope="col">user</th>
		<th scope="col">threshold</th>
		<th scope="col">fulfulled</th>
		<th scope="col">confirmed</th>
		<th scope="col">shorthand</th>
	</tr>
	</thead>
	<tbody>
	{#each campaign.participations as participation (participation.id)}
		<tr>
			<td>{participation.user.name}</td>
			<td>{participation.threshold}</td>
			<td>{participation.condition_is_fulfilled}</td>
			<td>{participation.confirmed}</td>
			<td class="{get_status_class(participation)}">{get_tickmark(participation)}</td>
		</tr>
	{/each}
	</tbody>
</table>
