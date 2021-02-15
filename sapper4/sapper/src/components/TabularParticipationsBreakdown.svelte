<script>
	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import {Table} from 'sveltestrap';
	import {get_status_class,get_tickmark,short_description} from 'srcs/stuff.js';
	export let campaign;
</script>
<table responsive>
	<thead>
	<tr>
		<th scope="col">user</th>
		<th scope="col">wants</th>
		<th scope="col">status</th>
	</tr>
	</thead>
	<tbody>
	{#each campaign.participations as participation (participation.id)}
		<tr>
			<td><a href="/users/{participation.user.id}">{participation.user.name}</a></td>
			<td>
				<ToolTipsy>{participation.threshold}
					<div slot="tooltip" class="info_tooltip">
						{participation.threshold} other people must join.
					</div>
				</ToolTipsy>
			</td>
			<td>{get_tickmark(participation)} - {short_description(participation)}</td>
		</tr>
	{/each}
	</tbody>
</table>
