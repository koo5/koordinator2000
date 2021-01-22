<script lang='js'>
	import MyParticipation from './MyParticipation.svelte';
	import MutationForm from 'cmps/MutationForm.svelte';
	import gql from 'graphql-tag';
	import {my_user} from 'srcs/my_user.js';
	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import ParticipationBadge from 'cmps/ParticipationBadge.svelte';
	import DismissalBadge from 'cmps/DismissalBadge.svelte';


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

<hr>

<li>

	<ToolTipsy enabled="{my_user.database_debug}" css_ref="dev">
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

	<p>
	<div>participants (sorted from lowest threshold):<br/> "✔" - participating<br/> "?" - condition fulfilled, waiting for confirmation<br/> "…" - condition was not fulfilled yet<br/> 👎 - disagreement/dismissal
	</div>
	{#each campaign.participations as participation (participation.id)}
		<ParticipationBadge {participation}/>
	{/each}
	{#each campaign.campaign_dismissals as dismissal (dismissal.user_id)}
		<DismissalBadge {dismissal}/>
	{/each}

	<MutationForm
			mutation={CAMPAIGN_DISMISSAL}
			variables={{
				user_id: $my_user.id,
				campaign_id: campaign.id
			}}
	>
		<button type="submit">dismiss campaign</button>
	</MutationForm>

	<hr>
</li>


<style>

    pre {
        overflow-x: scroll;
        overflow-y: scroll;
        width: 300px;
        height: 300px;
    }

    :global(.dev) {
        border-style: dotted;
        background-color: rgb(230, 230, 230);
    }

</style>
