<script lang='js'>
	import MyParticipation from './MyParticipation.svelte';
	import MutationForm from 'cmps/MutationForm.svelte';
	import {subscribe, gql} from "srcs/apollo.js";
	import {my_user, default_participations_display_style, get_my_participation} from 'srcs/my_user.js';
	import ToolTipsy from 'cmps/ToolTipsy.svelte';
	import ParticipationBadge from 'cmps/ParticipationBadge.svelte';
	import DismissalBadge from 'cmps/DismissalBadge.svelte';
	import TabularParticipationsBreakdown from 'cmps/TabularParticipationsBreakdown.svelte';
	import ProgressBar from "@okrad/svelte-progressbar";
	import {Progress} from 'sveltestrap';
	//import {slide, fade} from 'svelte/transition';
	/*import { flip } from 'svelte/animate';
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';*/


	export let campaign;
	$: my_participation = get_my_participation(campaign, $my_user);

	/*
	$: confirmed_percent = get_confirmed_percent($my_user, my_participation);
	function get_confirmed_percent(my_user, my_participation)
	{

		another importaint anspect here: percent of *my* threshold
		if (!my_participation.id) return 0;
		//my_participation.threshold
		return 10;
	}

	$: series = [
        {
                perc: confirmed_percent,
                color: '#88ff88'
        },
        {
                perc: 32,
                color: '#ccffcc'
        }
	]*/

	// campaign.unconfirmed_fulfilled_count.aggregate.count;
	// campaign.confirmed_fulfilled_count.aggregate.count;

	$: suggested_optimal_threshold = campaign.suggested_optimal_threshold;

	// participations_contributing_towards_reaching_optimal_threshold
	const CONTRIBUTING_COUNT = gql`
		subscription ($threshold: Int, $campaign_id:Int, $confirmed: Boolean) {
		  participations_aggregate(where: {threshold: {_lte: $threshold}, confirmed: {_eq: $confirmed}, campaign_id: {_eq: $campaign_id}}) {
			aggregate {
			  count
			}
		  }
		}
	`;

	$: confirmed_contributing_count_q = subscribe(CONTRIBUTING_COUNT, {
			variables: {
				threshold: campaign.suggested_optimal_threshold,
				campaign_id: campaign.id,
				confirmed: true
			}
		}
	);
	$: unconfirmed_contributing_count_q = subscribe(CONTRIBUTING_COUNT, {
			variables: {
				threshold: campaign.suggested_optimal_threshold,
				campaign_id: campaign.id,
				confirmed: false
			}
		}
	);
	$: confirmed_contributing_count = $confirmed_contributing_count_q.data && $confirmed_contributing_count_q.data.participations_aggregate.aggregate.count;
	$: unconfirmed_contributing_count = $unconfirmed_contributing_count_q.data && $unconfirmed_contributing_count_q.data.participations_aggregate.aggregate.count;
	$: confirmed_contributing_count_str = confirmed_contributing_count == undefined ? '???' : confirmed_contributing_count;
	$: unconfirmed_contributing_count_str = unconfirmed_contributing_count == undefined ? '???' : unconfirmed_contributing_count;

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
	<div class="campaign">
		<hr>
		<ToolTipsy enabled="{!!$my_user.database_debug}" css_ref="dev">
			<div slot="tooltip">
				<small><pre>
						{JSON.stringify(campaign, null, '  ')}
					</pre>
				</small>
			</div>
		</ToolTipsy>

		<h2>{campaign.title}</h2>

		<p>{campaign.description}</p>

		<h5>My threshold</h5>
		<i>I will join when other people join:</i><br>

		<MyParticipation campaign={campaign} on:my_participation_upsert/>
		<br>

		<h5>Participants</h5>
		<i>We want {suggested_optimal_threshold} people:</i><br>

		<Progress multi>
			<Progress bar color="success"
					  value={confirmed_contributing_count}
					  max={suggested_optimal_threshold}>
				{confirmed_contributing_count}</Progress>
			<!-- how to make the below the "light green" "unconfirmed participation"? -->
			<Progress bar color="warning"
					  value={unconfirmed_contributing_count}
					  max={suggested_optimal_threshold}>
				{unconfirmed_contributing_count}</Progress>
		</Progress>
		{confirmed_contributing_count_str} are confirmed, {unconfirmed_contributing_count_str} are unconfirmed.<br>

		<p></p>
		<ToolTipsy enabled="{!$my_user.hide_help}">
			participating users (sorted from lowest threshold to highest):
			<div slot="tooltip">
				<div class="help_tooltip">
					Help:
					<br/> "✅" - participating, confirmed<br/> "✉" - condition fulfilled,
					waiting for confirmation<br/> "👁" - condition was not fulfilled yet/waiting<br/> 👎 -
					disagreement/dismissal
				</div>
			</div>
		</ToolTipsy>

		{#if default_participations_display_style($my_user) == 'facebook'}
			emojis go here
		{:else if default_participations_display_style($my_user) == 'koo1_introductory'}
			wordy stuff goes here
		{:else if default_participations_display_style($my_user) == 'koo1'}
			{#each campaign.participations as participation (participation.id)}
				<span
				>
					<ParticipationBadge {participation}/>
				</span>
			{/each}
		{:else}
			<TabularParticipationsBreakdown {campaign}/>
		{/if}
		<br>

		<ToolTipsy enabled="{!$my_user.hide_help}">
			and these users dismissed the campaign:
			<div slot="tooltip">
				<div class="help_tooltip">
					Maybe they think it is stupid, or they just want to get back to it later. At any case, they don't
					want to see it now.
				</div>
			</div>
		</ToolTipsy>

		{#each campaign.campaign_dismissals as dismissal (dismissal.user_id)}
			<span
			>
				<DismissalBadge {dismissal}/>
			</span>
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
