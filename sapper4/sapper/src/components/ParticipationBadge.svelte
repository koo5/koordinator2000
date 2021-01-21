<script lang='js'>
	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import {my_user} from 'srcs/my_user.js';

	export let participation;
	$: status_class = get_status_class(participation);

	function get_status_class(participation)
	{
		if (participation.condition_is_fulfilled)
		{
			if (participation.confirmed)
			{
				return "confirmed"
			}
			else
				return "condition_is_fulfilled"
		}
		else
			return "condition_is_not_fulfilled"
	}

	$: tickmark = get_tickmark(participation);

	function get_tickmark(participation)
	{
		if (participation.condition_is_fulfilled)
		{
			if (participation.confirmed)
			{
				return '✔'
			}
			else
				return "❓"
		}
		else
			return ""
	}

</script>

<span class='participation_badge'>
				<span class="{status_class}">
					{tickmark}{participation.user.name}&nbsp;
				<ToolTipsy>
					({participation.threshold})
					<div slot="tooltip" class="{status_class}">
						{#if $my_user.database_debug}
							participation ID:{participation.id}<br>
							user ID: {participation.user.id}<br>
						{/if}
						user name: {participation.user.name}<br>
						how many people must participate:{participation.threshold}<br>
						condition is fulfilled: {participation.condition_is_fulfilled}<br>
					</div>
				</ToolTipsy>
				</span>
			</span>
<span> </span>

<style>

	.participation_badge {
		border-radius: 1px;
	}

</style>
