<script lang="js">
    import { Button, Progress } from './ui';
    import { sanitize_html } from '$lib/client/campaign.ts';
    import MyParticipation from './MyParticipation.svelte';
    import MutationForm from './MutationForm.svelte';
    import { getContextClient, gql, subscriptionStore } from '$lib/urql.ts';
    import { default_participations_display_style, get_my_participation, my_user } from '$lib/client/my_user.ts';
    import ToolTipsy from './ToolTipsy.svelte';
    import ParticipationBadge from './ParticipationBadge.svelte';
    import DismissalBadge from './DismissalBadge.svelte';
    import TabularParticipationsBreakdown from './TabularParticipationsBreakdown.svelte';
    import TagManager from './TagManager.svelte';
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
            participations_aggregate(where: { threshold: { _lt: $threshold }, confirmed: { _eq: $confirmed }, campaign_id: { _eq: $campaign_id }, account: { smazano: { _eq: false } } }) {
                aggregate {
                    count
                }
            }
        }
    `;

    $: confirmed_contributing_count_q = subscriptionStore({
        client: getContextClient(),
        query: CONTRIBUTING_COUNT,
        variables: {
            threshold: suggested_mass,
            campaign_id: campaign.id,
            confirmed: true,
        },
    });

    $: unconfirmed_contributing_count_q = subscriptionStore({
        client: getContextClient(),
        query: CONTRIBUTING_COUNT,
        variables: {
            threshold: suggested_mass,
            campaign_id: campaign.id,
            confirmed: false,
        },
    });
    $: confirmed_contributing_count = $confirmed_contributing_count_q.data && $confirmed_contributing_count_q.data.participations_aggregate.aggregate.count;
    $: unconfirmed_contributing_count = $unconfirmed_contributing_count_q.data && $unconfirmed_contributing_count_q.data.participations_aggregate.aggregate.count;
    $: confirmed_contributing_count_str = confirmed_contributing_count == undefined ? '???' : confirmed_contributing_count;
    $: unconfirmed_contributing_count_str = unconfirmed_contributing_count == undefined ? '???' : unconfirmed_contributing_count;

    const CAMPAIGN_DISMISSAL = gql`
        mutation MyMutation($campaign_id: Int, $user_id: Int) {
            insert_campaign_dismissals_one(object: { campaign_id: $campaign_id, account_id: $user_id }) {
                campaign_id
                account_id
            }
        }
    `;
</script>

<div class="campaign">
    {#if $my_user.database_debug}
        <div class="content_block">
            <ToolTipsy enabled={!!$my_user.database_debug} css_ref="dev">
                <div slot="tooltip">
                    <small>
                        <pre>
							{JSON.stringify(campaign, null, '  ')}
						</pre>
                    </small>
                </div>
            </ToolTipsy>
        </div>
    {/if}

    <h2>
        {#if is_detail_view}
            {campaign.title}
        {:else}
            {campaign.title}<a href="/campaign/{campaign.id}">...</a>
        {/if}
    </h2>
    <h5>Description</h5>
    <div class="content_block">
        <p>{@html sanitize_html(campaign.description)}</p>
    </div>

    <h5>Tags</h5>
    <div class="content_block">
        <TagManager campaignId={campaign.id} tags={campaign.tags?.map(t => ({ id: t.tag.id, name: t.tag.name })) || []} readOnly={!is_detail_view} size="md" />
    </div>

    <h5>My participation</h5>
    <div class="content_block">
        <i>I will join when other people join:</i><br />

        <MyParticipation {campaign} on:my_participation_upsert />
    </div>
    <h5>Progress</h5>
    <div class="content_block">


        <Progress multi>
            {#if campaign.collect_confirmations}
                <Progress bar color="success" value={confirmed_contributing_count} max={suggested_mass} confirmed>
                    {confirmed_contributing_count}</Progress
                >
            {/if}
            <!-- how to make the below the "light green" "unconfirmed participation"? -->
            <Progress bar color="warning" value={unconfirmed_contributing_count} max={suggested_mass} unconfirmed>
                {unconfirmed_contributing_count}</Progress
            >
        </Progress>
        {#if campaign.collect_confirmations}
            {confirmed_contributing_count_str} confirmed, {unconfirmed_contributing_count_str} unconfirmed
        {:else}
            {unconfirmed_contributing_count_str} participating
        {/if}
        <i>of {suggested_mass} campaign goal</i><br />
    </div>
    <h5>Participants</h5>
    <div class="content_block">
        <ToolTipsy enabled={!$my_user.hide_help}>
            participating users (sorted from lowest threshold to highest):
            <div slot="tooltip">
                <div class="help_tooltip">
                    Help:
                    <br /> "✅" - participating, {campaign.collect_confirmations ? 'confirmed' : 'threshold reached'}
                    {#if campaign.collect_confirmations}
                        <br /> "✉" - condition fulfilled, waiting for confirmation
                    {/if}
                    <br /> "👁" - condition was not fulfilled yet/waiting<br /> 👎 - disagreement/dismissal
                </div>
            </div>
        </ToolTipsy>

        {#if default_participations_display_style($my_user) == 'facebook'}
            emojis go here
        {:else if default_participations_display_style($my_user) == 'koo1_introductory'}
            wordy stuff goes here
        {:else if default_participations_display_style($my_user) == 'koo1'}
            {#each campaign.participations as participation (participation.id)}
                <span>
                    <ParticipationBadge {participation} {campaign} />
                </span>
            {/each}
        {:else}
            <TabularParticipationsBreakdown {campaign} />
        {/if}
        <br />
    </div>
    <h5>Dismissals</h5>
    <div class="content_block">
        <ToolTipsy enabled={!$my_user.hide_help}>
            And these users dismissed the campaign:<br />
            <div slot="tooltip">
                <div class="help_tooltip">
                    <p>Maybe they think it is stupid, or they just want to get back to it later.</p>
                     At any case, they don't want to see it now.
                </div>
            </div>
        </ToolTipsy>

        {#each campaign.campaign_dismissals as dismissal (dismissal.account_id)}
            <span>
                <DismissalBadge {dismissal} />
            </span>
        {/each}
        <br />
        <MutationForm
            mutation={CAMPAIGN_DISMISSAL}
            variables={{
                user_id: $my_user.id,
                campaign_id: campaign.id,
            }}
        >
            <Button color="secondary" type="submit">dismiss campaign</Button>
        </MutationForm>
    </div>

    <!-- <a href="/campaign/{campaign.id}">details...</a> -->
</div>

<style>
    pre {
        overflow-x: scroll;
        overflow-y: scroll;
        width: 100%;
        height: 100%;
    }
</style>
