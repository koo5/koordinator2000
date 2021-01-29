<script lang='js'>
	import MyParticipation from './MyParticipation.svelte';
	import MutationForm from 'cmps/MutationForm.svelte';
	import gql from 'graphql-tag';
	import {my_user} from 'srcs/my_user.js';
	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import ParticipationBadge from 'cmps/ParticipationBadge.svelte';
	import DismissalBadge from 'cmps/DismissalBadge.svelte';
	import {slide} from 'svelte/transition';
	import ProgressBar from "@okrad/svelte-progressbar";


	export let campaign;
	let series = [20, 16];


	const CAMPAIGN_DISMISSAL = gql`
		mutation MyMutation($campaign_id: Int, $user_id: Int) {
		  insert_campaign_dismissals_one(object: {campaign_id: $campaign_id, user_id: $user_id}) {
			campaign_id
			user_id
		  }
		}
	`

</script>


<li transition:slide|local>
	<div class="campaign">

		<ToolTipsy enabled="{my_user.database_debug}" css_ref="dev">
			<h2>{campaign.title}</h2>
			<pre slot="tooltip">
				{JSON.stringify(campaign, null, '  ')}
			</pre>
		</ToolTipsy>

		{#if process.browser}
			<ProgressBar {series} height={5} showProgressValue={false} />
		{/if}

		<p>{campaign.description}</p>

		<span class="{campaign.my_participations[0] ? (campaign.my_participations[0].condition_is_fulfilled ? 'condition_is_fulfilled' : 'condition_is_not_fulfilled') : ''}">
				{campaign.my_participations[0] ? (campaign.my_participations[0].condition_is_fulfilled ? 'threshold is reached:' : 'threshold is not reached:') : 'not participating:'}
		</span>

		<MyParticipation campaign={campaign}/>

		<p></p>
		<ToolTipsy enabled="{!$my_user.hide_help}">
			participating users (sorted from lowest threshold to highest):
			<div slot="tooltip">
				<div class="help_tooltip">
				Help:
				<br/> "✔" - participating<br/> "?" - condition fulfilled,
				waiting for confirmation<br/> "…" - condition was not fulfilled yet<br/> 👎 - disagreement/dismissal
				</div>
			</div>
		</ToolTipsy>

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
	</div>

</li>

<style>

    .campaign {
        border-style: line;
    }

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
