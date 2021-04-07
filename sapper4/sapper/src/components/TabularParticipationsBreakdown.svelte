<script>
	//import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import {Table} from 'sveltestrap';
	//import {get_status_class,get_tickmark,short_description,long_description} from 'srcs/stuff.js';
	//import {my_user} from 'srcs/my_user.js';
	import TabularParticipationsRow from 'cmps/TabularParticipationsRow.svelte';

	export let campaign;

	$: participations = add_idxs(campaign.participations);
	function add_idxs(participations)
	{
		let i = 0;
		return participations.map(participation =>
			({...participation, idx: i++})
		);
	}

	$: suggested = campaign.suggested_optimal_threshold;
	$: remaining = suggested - le.length;
	$: le = participations.filter(participation => participation.idx <= suggested);
	$: gt = participations.filter(participation => participation.idx > suggested);

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
		<td colspan="4">
		<b>
		<center>
			{#if remaining > 0}
				{remaining} more people needed to reach the suggested {suggested + 1} participants
			{:else}
				🎉 🎉 🎉 goal of {suggested + 1} participants reached! 🎉 🎉 🎉
			{/if}
		</center>
		</b>
		</td>
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
