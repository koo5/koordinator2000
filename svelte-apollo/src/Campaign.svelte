<script>
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe} from 'svelte-apollo';
	import MyParticipation from './MyParticipation.svelte';

	export let campaign;

</script>

<style>

	.condition_is_fulfilled	{
		font-weight: bold;
		background-color: lightgreen;
	}

	.condition_is_not_fulfilled	{
		font-weight: 900;
		background-color: orange;
		  text-transform: uppercase;
	}

	.tooltip {
		border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
	}

	/* Tooltip text */
	.tooltip .tooltiptext {
		visibility: hidden;
		width: 120px;
		background-color: yellow;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;

		/* Position the tooltip text - see examples below! */
		position: absolute;
		z-index: 1;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
		visibility: visible;
	}
</style>


<li>
	<h4>{campaign.id} - {campaign.title}</h4>
</li>

<p>{campaign.description}</p>

<MyParticipation campaign={campaign}/>


<p>
	participants:
	{#each campaign.participations as participation (participation.id)}
		<div class="{participation.condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled'}">
			"{participation.condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled'}"
			<span class='tooltip'>{participation.user.name}
				<span class="tooltiptext">user id:{participation.user.id}</span>
			</span>(
			<span class='tooltip'>{participation.threshold}
				<span class="tooltiptext">participation id:{participation.id}</span>)
			</span>
		</div>
	{/each}

</p>
