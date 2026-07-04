<script lang="ts">
    import { t, tp } from '$lib/i18n';
    import { type Campaign, decrease_auth_nag_postponement, get_my_participation, my_user, type MyUser } from '$lib/client/my_user.ts';
    import gql from 'graphql-tag';
    import MutationForm from './MutationForm.svelte';
    import { createEventDispatcher } from 'svelte';
    import { get_tickmark } from '$lib/client/campaign.ts';

    const dispatch = createEventDispatcher();

    export let campaign: Campaign;
    let new_threshold = campaign.suggested_optimal_threshold;
    $: my_participation = get_my_participation(campaign, $my_user);
    $: update_new_threshold_when_user_changes($my_user);

    function update_new_threshold_when_user_changes(u: MyUser): void {
        if (my_participation.threshold != undefined) new_threshold = my_participation.threshold;
    }

    $: update_button_disabled = my_participation.threshold == new_threshold;

    const UPSERT = gql`
        mutation MyMutation($campaign_id: Int, $threshold: Int) {
            insert_participations(objects: { campaign_id: $campaign_id, threshold: $threshold }, on_conflict: { constraint: participations_campaign_id_user_id, update_columns: threshold }) {
                affected_rows
            }
        }
    `;

    const DELETE = gql`
        mutation MyMutation($id: Int!) {
            delete_participations_by_pk(id: $id) {
                id
            }
        }
    `;

    $: upsert_vars = {
        campaign_id: campaign.id,
        threshold: new_threshold,
    };

    function on_participated() {
        dispatch('my_participation_upsert');
        decrease_auth_nag_postponement();
    }
</script>

<div class="participation-box" class:active={my_participation.id && my_participation.condition_is_fulfilled}>
    <MutationForm on:done={() => (my_participation.id ? dispatch('my_participation_upsert') : on_participated())} mutation={UPSERT} variables={upsert_vars}>
        <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm">{$t('pledge.prefix')}</span>
            <input
                class="input input-bordered input-sm w-24 text-center font-semibold"
                type="number"
                min="0"
                max="9999999999"
                placeholder={String(campaign.suggested_optimal_threshold ?? '')}
                bind:value={new_threshold}
                aria-label="my threshold"
            />
            <span class="text-sm">{$tp('pledge.suffix', new_threshold ?? 0)}</span>
            {#if my_participation.id}
                <button class="btn btn-success btn-sm" type="submit" disabled={update_button_disabled}>{$t('pledge.update')}</button>
            {:else}
                <button class="btn btn-primary btn-sm" type="submit">{$t('pledge.button')}</button>
            {/if}
        </div>
    </MutationForm>

    <p class="mt-1.5 mb-0 text-xs opacity-60">
        {$t('pledge.suggested', { lo: campaign.suggested_lowest_threshold, hi: campaign.suggested_highest_threshold, def: campaign.suggested_optimal_threshold })}
    </p>

    <div class="mt-2 flex items-center gap-2 text-sm">
        {#if my_participation.threshold != undefined}
            <span>{get_tickmark(my_participation)}</span>
            {#if my_participation.condition_is_fulfilled}
                <span class="font-semibold text-success">{$t('pledge.active')}</span>
            {:else}
                <span class="opacity-75">{$t('pledge.waiting')}</span>
            {/if}
            <MutationForm on:done={() => dispatch('my_participation_upsert')} mutation={DELETE} variables={{ id: my_participation.id }}>
                <button class="btn btn-ghost btn-xs text-error" type="submit">{$t('pledge.withdraw')}</button>
            </MutationForm>
        {:else}
            <span class="opacity-60">{$t('pledge.not_pledged')}</span>
        {/if}
    </div>
</div>

<style>
    .participation-box {
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        padding: 0.9rem 1rem;
        background: color-mix(in oklab, var(--color-base-200) 55%, transparent);
    }
    .participation-box.active {
        border-color: color-mix(in oklab, var(--color-success) 45%, transparent);
        background: color-mix(in oklab, var(--color-success) 7%, transparent);
    }
</style>
