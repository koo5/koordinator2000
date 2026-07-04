<script lang="ts">
    import { t, tp } from '$lib/i18n';
    import { sanitize_html } from '$lib/client/campaign.ts';
    import MyParticipation from './MyParticipation.svelte';
    import MutationForm from './MutationForm.svelte';
    import { getContextClient, gql, subscriptionStore } from '$lib/urql.ts';
    import { default_participations_display_style, get_my_participation, my_user } from '$lib/client/my_user.ts';
    import type { Campaign as CampaignType, Participation as ParticipationType } from '$lib/client/my_user.ts';
    import ToolTipsy from './ToolTipsy.svelte';
    import ParticipationBadge from './ParticipationBadge.svelte';
    import TabularParticipationsBreakdown from './TabularParticipationsBreakdown.svelte';
    import TagManager from './TagManager.svelte';
    import LocationMap from './LocationMap.svelte';
    import EditCampaign from './EditCampaign.svelte';
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

    // A maintainer editing their own campaign (detail view only).
    let editing = false;
    $: is_maintainer = is_detail_view && $my_user?.id > 0 && $my_user.id === campaign.maintainer_id;

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

    {#if editing}
        <EditCampaign {campaign} on:saved={() => (editing = false)} on:cancel={() => (editing = false)} />
    {:else}
    <div class="title-row">
        <h2 class="grow">
            {#if is_detail_view}
                {campaign.title}
            {:else}
                <a class="title-link" href="/campaign/{campaign.id}">{campaign.title}</a>
            {/if}
        </h2>
        {#if is_maintainer}
            <button class="btn btn-ghost btn-sm" type="button" on:click={() => (editing = true)}>{$t('edit.button')}</button>
        {/if}
    </div>
    <div class="content_block description">
        <p>{@html sanitize_html(campaign.description || '')}</p>
    </div>

    {#if campaign.country}
        <div class="content_block">
            <span class="badge badge-ghost badge-sm">🌍 {$t('country.' + campaign.country)}</span>
        </div>
    {/if}

    {#if campaign.location_name || campaign.latitude != null}
        <div class="content_block">
            <p class="text-sm opacity-70 mt-0 mb-1">📍 {campaign.location_name || `${campaign.latitude}, ${campaign.longitude}`}</p>
            {#if is_detail_view && campaign.latitude != null && campaign.longitude != null}
                <LocationMap latitude={campaign.latitude} longitude={campaign.longitude} radius_km={campaign.location_radius} />
            {/if}
        </div>
    {/if}

    <h5>{$t('campaign.tags')}</h5>
    <div class="content_block">
        <TagManager campaignId={campaign.id} tags={campaign.tags?.map(t => ({ id: t.tag.id, name: t.tag.name })) || []} readOnly={!is_detail_view} size="md" />
    </div>

    <h5>{$t('campaign.my_participation')}</h5>
    <div class="content_block">
        <MyParticipation {campaign} on:my_participation_upsert />
    </div>

    <h5>{$t('campaign.progress')}</h5>
    <div class="content_block">
        <progress
            class="progress progress-success w-full"
            value={Math.min(contributing_count || 0, suggested_mass)}
            max={suggested_mass}
        ></progress>
        <div class="flex items-center justify-between text-sm">
            <span class="font-semibold">{$tp('progress.pledged', contributing_count || 0)}</span>
            {#if (contributing_count || 0) >= suggested_mass}
                <span class="badge badge-success badge-sm">{$t('progress.goal_reached', { n: suggested_mass })}</span>
            {:else}
                <span class="opacity-60">{$t('progress.goal', { n: suggested_mass })}</span>
            {/if}
        </div>
    </div>
    <h5>{$t('campaign.participants')}</h5>
    <div class="content_block">
        <p class="text-xs opacity-60 mt-0 mb-2">{$t('campaign.participants_hint')}</p>
        {#if default_participations_display_style($my_user) == 'koo1'}
            {#each campaign.participations || [] as participation (participation.id)}
                <span>
                    <ParticipationBadge {participation} {campaign} />
                </span>
            {/each}
        {:else}
            <TabularParticipationsBreakdown {campaign} />
        {/if}
    </div>
    <!-- Dismissing is a PRIVATE action ("hide from my deck") — who dismissed a
         campaign is deliberately not shown (negative social signal). -->
    {#if is_detail_view}
        <div class="content_block mt-4">
            <MutationForm
                mutation={CAMPAIGN_DISMISSAL}
                variables={{
                    user_id: $my_user.id,
                    campaign_id: campaign.id,
                }}
            >
                <button class="btn btn-ghost btn-xs opacity-60" type="submit" title={$t('listing.not_interested')}>{$t('campaign.not_interested')}</button>
            </MutationForm>
        </div>
    {/if}
    {/if}

    <!-- <a href="/campaign/{campaign.id}">details...</a> -->
</div>

<style>
    pre {
        overflow-x: scroll;
        overflow-y: scroll;
        width: 100%;
        height: 100%;
    }
    .title-row {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
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
