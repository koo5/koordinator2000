<script lang='js'>
	import MyParticipation from './MyParticipation.svelte';
	import MutationForm from 'cmps/MutationForm.svelte';
	import gql from 'graphql-tag';
	import { my_user } from 'srcs/my_user.js';
	import ToolTipsy from 'cmps/ToolTipsy.svelte';


	export let campaign;


	const CAMPAIGN_DISMISSAL = gql`
		mutation MyMutation($campaign_id: Int, $user_id: Int) {
		  insert_campaign_dismissals_one(object: {campaign_id: $campaign_id, user_id: $user_id}) {
			campaign_id
			user_id
		  }
		}
	`

</script>


	<li>

		<ToolTipsy css_ref="dev">
			<h3>{campaign.title}</h3>
			<pre slot="tooltip">
				{JSON.stringify(campaign, null, '  ')}
			</pre>
		</ToolTipsy>

		<p>{campaign.description}</p>

		<span class="{campaign.my_participations[0] ? (campaign.my_participations[0].condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled') : ''}">
				{campaign.my_participations[0] ? (campaign.my_participations[0].condition_is_fulfilled ? 'threshold is reached:' : 'threshold is not reached:') : 'not participating:'}
		</span>

		<MyParticipation campaign={campaign}/>

		<MutationForm
			mutation={CAMPAIGN_DISMISSAL}
			variables={{
				user_id: $my_user.id,
				campaign_id: campaign.id
			}}
		>
			<button type="submit">dismiss</button>
		</MutationForm>

	<p>
		participants:
		{#each campaign.participations as participation (participation.id)}
			<span class='tooltip participation_badge'><span class="{participation.condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled'} tooltiptext">
					{#if $my_user.database_debug}
						participation ID:{participation.id}<br>
						user ID: {participation.user.id}<br>
					{/if}
					user name: {participation.user.name}<br>
					how many people must participate:{participation.threshold}<br>
					condition is fulfilled: {participation.condition_is_fulfilled}<br>
				</span><span class="{participation.condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled'}">{participation.condition_is_fulfilled ? '✔' : '❌'}{participation.user.name}</span>(<span class='tooltip'>{participation.threshold})</span>
			</span><span> </span>
		{/each}

	</p>
	<hr>
</li>



<style>

	.participation_badge {
		border-radius: 1px;
	}

	.tooltip {
		border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
	}

	.tooltiptext {
		visibility: hidden;
		position: absolute;
		z-index: 1;
		padding: 1em 1em;
	}

	pre {
		overflow-x: scroll;
		overflow-y: scroll;
		width: 300px;
		height: 300px;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
		visibility: visible;
	}

</style>
