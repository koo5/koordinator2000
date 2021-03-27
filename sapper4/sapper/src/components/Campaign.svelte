<script lang='js'>
	import {
		Button,
	} from 'sveltestrap';
	import { readable } from 'svelte/store';
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
	export let is_detail_view = false;


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
	$: suggested_mass = campaign.suggested_optimal_threshold + 1;

	// participations_contributing_towards_reaching_optimal_threshold
	const CONTRIBUTING_COUNT = gql`
		subscription ($threshold: Int, $campaign_id: Int, $confirmed: Boolean) {
		  participations_aggregate(where: {threshold: {_lt: $threshold}, confirmed: {_eq: $confirmed}, campaign_id: {_eq: $campaign_id}, account: {smazano: {_eq: false}}}) {
			aggregate {
			  count
			}
		  }
		}
	`;

	$: confirmed_contributing_count_q = false ? readable({}) : subscribe(CONTRIBUTING_COUNT, {
			variables: {
				threshold: suggested_mass,
				campaign_id: campaign.id,
				confirmed: true
			}
		}
	);
	$: unconfirmed_contributing_count_q = false ? readable({}) : subscribe(CONTRIBUTING_COUNT, {
			variables: {
				threshold: suggested_mass,
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
		  insert_campaign_dismissals_one(object: {campaign_id: $campaign_id, account_id: $user_id}) {
			campaign_id
			account_id
		  }
		}
	`

</script>



	<div class="campaign">
		<ToolTipsy enabled="{!!$my_user.database_debug}" css_ref="dev">
			<div slot="tooltip">
				<small><pre>
						{JSON.stringify(campaign, null, '  ')}
					</pre>
				</small>
			</div>
		</ToolTipsy>

		<h2>
			{#if is_detail_view}
				{campaign.title}
			{:else}
				<a href="/campaign/{campaign.id}">{campaign.title}</a>
			{/if}
		</h2>
		<h5>Description</h5>
		<p>{@html campaign.description}</p>

		<h5>My participation</h5>
		<i>I will join when other people join:</i><br>

		<MyParticipation campaign={campaign} on:my_participation_upsert/>

		<h5>Progress</h5>
		<i>We want {suggested_mass} people:</i><br>

		<Progress multi>
			<Progress bar color="success"
					  value={confirmed_contributing_count}
					  max={suggested_mass}
					  confirmed
					  >
				{confirmed_contributing_count}</Progress>
			<!-- how to make the below the "light green" "unconfirmed participation"? -->
			<Progress bar color="warning"
					  value={unconfirmed_contributing_count}
					  max={suggested_mass}
					  unconfirmed
					  >

				{unconfirmed_contributing_count}</Progress>
		</Progress>
		{confirmed_contributing_count_str} are confirmed, {unconfirmed_contributing_count_str} are unconfirmed.<br>

		<h5>Participants</h5>
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

		<h5>Dismissals</h5>
		<ToolTipsy enabled="{!$my_user.hide_help}">
			And these users dismissed the campaign:<br>
			<div slot="tooltip">
				<div class="help_tooltip">
					<p>Maybe they think it is stupid, or they just want to get back to it later.</p> At any case, they don't
					want to see it now.
				</div>
			</div>
		</ToolTipsy>

		{#each campaign.campaign_dismissals as dismissal (dismissal.account_id)}
			<span
			>
				<DismissalBadge {dismissal}/>
			</span>
		{/each}
		<br/>
		<MutationForm
				mutation={CAMPAIGN_DISMISSAL}
				variables={{
				user_id: $my_user.id,
				campaign_id: campaign.id
			}}
		>
			<Button color="secondary" type="submit">dismiss campaign</Button>
		</MutationForm>

		<hr>
	</div>


<style>

	.campaign {
		border-style: line;
	}

	pre {
		overflow-x: scroll;
		overflow-y: scroll;
		width: 100%;
		height: 100%;
	}

</style>
