<script>
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe} from 'svelte-apollo';
	import MyParticipation from './MyParticipation.svelte';

	export let campaign;

</script>

<style>

	.participation_badge {
		border-radius: 1px;
	}

	.tooltip {
		border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
	}

	/* Tooltip text */
	.tooltip .tooltiptext {
		visibility: hidden;
		background-color: yellow;
		text-align: center;
		padding: 1em 1em;
		border-radius: 6px;

		/* Position the tooltip text - see examples below! */
		position: absolute;
		z-index: 1;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
		visibility: visible;
	}



/* Thick red border */
hr {

}

</style>


	<span class='tooltip'>
		<span class="tooltiptext">
			ID:{campaign.id}<br>
		</span>
		<li><h4>{campaign.title}</h4></li>
	</span>

	<p>{campaign.description}</p>

	<span class="{campaign.my_participations[0] ? (campaign.my_participations[0].condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled') : ''}">
			{campaign.my_participations[0] ? (campaign.my_participations[0].condition_is_fulfilled ? 'threshold is reached:' : 'threshold is not reached:') : 'not participating:'}
	</span>

	<MyParticipation campaign={campaign}/>

<p>
	participants:
	{#each campaign.participations as participation (participation.id)}
		<span class='tooltip participation_badge'><span class="tooltiptext">
				participation ID:{participation.id}<br>
				user ID: {participation.user.id}<br>
				user name: {participation.user.name}<br>
				how many people must participate:{participation.threshold}<br>
				condition is fulfilled: {participation.condition_is_fulfilled}<br>
			</span><span class="{participation.condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled'}">{participation.condition_is_fulfilled ? '✔' : '❌'}{participation.user.name}</span>(<span class='tooltip'>{participation.threshold})</span>
		</span><span> </span>
	{/each}

</p>
<hr>
