<script lang="ts">
    import { sanitize_html } from '$lib/client/campaign.ts';
    import MyParticipation from './MyParticipation.svelte';
    import MutationForm from './MutationForm.svelte';
    import { getContextClient, gql, subscriptionStore } from '$lib/urql.ts';
    import { default_participations_display_style, get_my_participation, my_user } from '$lib/client/my_user.ts';
    import type { Campaign as CampaignType, Participation as ParticipationType } from '$lib/client/my_user.ts';
    import ToolTipsy from './ToolTipsy.svelte';
    import ParticipationBadge from './ParticipationBadge.svelte';
    import DismissalBadge from './DismissalBadge.svelte';
    import TabularParticipationsBreakdown from './TabularParticipationsBreakdown.svelte';
    import TagManager from './TagManager.svelte';
    //import {slide, fade} from 'svelte/transition';
    /*import { flip } from 'svelte/animate';
    import { crossfade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';*/

    interface Dismissal {
        account_id: number;
    }

    interface Tag {
        tag: {
            id: number;
            name: string;
        }
    }

    interface ExtendedParticipation extends ParticipationType {
        id: number;
        account: {
            id: number;
            name: string;
        };
    }

    export let campaign: CampaignType & {
        description?: string;
        participations?: ExtendedParticipation[];
        campaign_dismissals?: Dismissal[];
        suggested_optimal_threshold?: number;
        tags?: Tag[];
    };
    export let is_detail_view = false;

    $: my_participation = get_my_participation(campaign, $my_user);

    $: suggested_optimal_threshold = campaign.suggested_optimal_threshold || 0;
    $: suggested_mass = campaign.suggested_optimal_threshold ? campaign.suggested_optimal_threshold + 1 : 1;

    // participations_contributing_towards_reaching_optimal_threshold
    const CONTRIBUTING_COUNT = gql`
        subscription ($threshold: Int, $campaign_id: Int) {
            participations_aggregate(where: { threshold: { _lt: $threshold }, campaign_id: { _eq: $campaign_id }, account: { smazano: { _eq: false } } }) {
                aggregate {
                    count
                }
            }
        }
    `;

    interface ContributingCountData {
        participations_aggregate: {
            aggregate: {
                count: number;
            }
        }
    }

    $: contributing_count_q = subscriptionStore<ContributingCountData>({
        client: getContextClient(),
        query: CONTRIBUTING_COUNT,
        variables: {
            threshold: suggested_mass,
            campaign_id: campaign.id,
        },
    });
    $: contributing_count = $contributing_count_q.data && $contributing_count_q.data.participations_aggregate.aggregate.count;
    $: contributing_count_str = contributing_count === undefined ? '???' : contributing_count;

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
            <a class="title-link" href="/campaign/{campaign.id}">{campaign.title}</a>
        {/if}
    </h2>
    <div class="content_block description">
        <p>{@html sanitize_html(campaign.description || '')}</p>
    </div>

    <h5>Tags</h5>
    <div class="content_block">
        <TagManager campaignId={campaign.id} tags={campaign.tags?.map(t => ({ id: t.tag.id, name: t.tag.name })) || []} readOnly={!is_detail_view} size="md" />
    </div>

    <h5>My participation</h5>
    <div class="content_block">
        <MyParticipation {campaign} on:my_participation_upsert />
    </div>

    <h5>Progress</h5>
    <div class="content_block">
        <progress
            class="progress progress-success w-full"
            value={Math.min(contributing_count || 0, suggested_mass)}
            max={suggested_mass}
        ></progress>
        <div class="flex items-center justify-between text-sm">
            <span><b>{contributing_count_str}</b> pledged</span>
            {#if (contributing_count || 0) >= suggested_mass}
                <span class="badge badge-success badge-sm">🎉 goal of {suggested_mass} reached</span>
            {:else}
                <span class="opacity-60">goal: {suggested_mass}</span>
            {/if}
        </div>
    </div>
    <h5>Participants</h5>
    <div class="content_block">
        <ToolTipsy enabled={!$my_user.hide_help}>
            participating users (sorted from lowest threshold to highest):
            <div slot="tooltip">
                <div class="help_tooltip">
                    Help:
                    <br /> "✅" - participating, threshold reached
                    <br /> "👁" - condition was not fulfilled yet/waiting<br /> 👎 - disagreement/dismissal
                </div>
            </div>
        </ToolTipsy>

        {#if default_participations_display_style($my_user) == 'facebook'}
            emojis go here
        {:else if default_participations_display_style($my_user) == 'koo1_introductory'}
            wordy stuff goes here
        {:else if default_participations_display_style($my_user) == 'koo1'}
            {#each campaign.participations || [] as participation (participation.id)}
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

        {#each campaign.campaign_dismissals || [] as dismissal (dismissal.account_id)}
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
            <button class="btn btn-outline btn-warning btn-xs" type="submit">Dismiss this campaign</button>
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
    .title-link {
        color: inherit;
        text-decoration: none;
    }
    .title-link:hover {
        color: var(--color-primary);
    }
    .description :global(p) {
        color: color-mix(in oklab, var(--color-base-content) 85%, transparent);
        line-height: 1.6;
        margin: 0;
    }
</style>
