<script lang='js'>

	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import {my_user} from 'srcs/my_user.js';
	import {get_status_class,get_tickmark} from 'srcs/stuff.js';

	export let participation;
	$: status_class = get_status_class(participation);
	$: tickmark = get_tickmark(participation);
	$: my_badge = $my_user.id == participation.user.id;

</script>

<span class='participation_badge'>
	<span class:my_badge={my_badge}>
		{#if my_badge}<span>⇛&nbsp;</span>{/if}

		<span class="{status_class}">
			{tickmark}{participation.user.name}
			<ToolTipsy>
				&nbsp;({participation.threshold})
				<div slot="tooltip" class="info_tooltip">
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
	{#if my_badge}<span>&nbsp;⇚</span>{/if}
	</span>
</span>
<span> </span>

<style>

    .participation_badge {
        border-radius: 1px;
    }

    .my_badge {
        font-family: bold;
        font-size: 180%;
    }

</style>
