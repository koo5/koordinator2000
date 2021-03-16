<script>
	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import {Table} from 'sveltestrap';
	import {get_status_class,get_tickmark,short_description,long_description} from 'srcs/stuff.js';
	import {my_user} from 'srcs/my_user.js';

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
			<td><a href="/users/{participation.account.id}">{participation.account.name}</a></td>
			<td>
				<ToolTipsy>{participation.threshold}
					<div slot="tooltip" class="info_tooltip">
						The number of other users that must start participating, before this user starts.
						{participation.threshold} other users must start first.
					</div>
				</ToolTipsy>
			</td>
			<td class={get_status_class(participation)}>
				<ToolTipsy enabled="{!$my_user.hide_help}">
				{get_tickmark(participation)} - {short_description(participation)}
				<div slot="tooltip">
					<div class="help_tooltip">
						{long_description(participation)}
					</div>
				</div>
				</ToolTipsy>
			</td>
		</tr>
	{/each}
	</tbody>
</table>
