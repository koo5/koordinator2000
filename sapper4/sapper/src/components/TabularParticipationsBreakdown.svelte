<script>
	//import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import {Table} from 'sveltestrap';
	//import {get_status_class,get_tickmark,short_description,long_description} from 'srcs/stuff.js';
	//import {my_user} from 'srcs/my_user.js';
	import TabularParticipationsRow from 'cmps/TabularParticipationsRow.svelte';

	export let campaign;

	var suggested = campaign.suggested_lowest_threshold;
	var le = campaign.participations.filter(participation => participation.threshold <= suggested);
	var gt = campaign.participations.filter(participation => participation.threshold > suggested);
</script>
<table responsive>
	<thead>
	<tr>
		<th scope="col">#</th>
		<th scope="col">user</th>
		<th scope="col">wants</th>
		<th scope="col">status</th>
	</tr>
	</thead>
	<tbody>
	{#each le as participation, idx}
		<TabularParticipationsRow participation={participation} idx={idx}/>
	{/each}
	<tr style="font-weight:bold">
		<td></td>
		<td>Suggested threshold</td>
		<td>{suggested}</td>
		<td></td>
	</tr>
	{#each gt as participation, idx}
		<TabularParticipationsRow participation={participation} idx={idx+le.length}/>
	{/each}
	</tbody>
</table>
<style>
	table {
		margin: 0;
		border: 1px inset rgba(128, 110, 164, 0.48);
		border-radius: 0px 17px 12px 13px;
		border-collapse: separate;
		border-spacing: 1em 0;
	}

</style>
