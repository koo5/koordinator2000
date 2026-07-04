<script lang="ts">
    /**
     * Maintainer-only edit form for a campaign's own fields (title, description,
     * thresholds, language, location). Tags are edited separately (inline on the
     * detail page). Uses update_campaigns_by_pk — Hasura scopes the write to the
     * maintainer, so a non-owner's mutation affects zero rows.
     */
    import { t } from '$lib/i18n';
    import { createEventDispatcher } from 'svelte';
    import { getContextClient, gql } from '$lib/urql.ts';
    import LocationPicker from './LocationPicker.svelte';
    import { COUNTRIES } from '$lib/client/countries.ts';

    export let campaign: any;

    const dispatch = createEventDispatcher();
    const client = getContextClient();

    let title = campaign.title ?? '';
    let description = campaign.description ?? '';
    let suggested_lowest_threshold = campaign.suggested_lowest_threshold ?? 1;
    let suggested_optimal_threshold = campaign.suggested_optimal_threshold ?? 100;
    let suggested_highest_threshold = campaign.suggested_highest_threshold ?? 10000;
    let language: string = campaign.language ?? 'en';
    let country: string = campaign.country ?? '';
    let latitude: number | null = campaign.latitude != null ? Number(campaign.latitude) : null;
    let longitude: number | null = campaign.longitude != null ? Number(campaign.longitude) : null;
    let location_name: string | null = campaign.location_name ?? null;
    let location_radius: number | null = campaign.location_radius != null ? Number(campaign.location_radius) : 50;

    let saving = false;
    let error = false;

    const UPDATE = gql`
        mutation UpdateCampaign(
            $id: Int!
            $title: String
            $description: String
            $lo: bigint
            $opt: bigint
            $hi: bigint
            $language: String
            $country: String
            $location_name: String
            $latitude: numeric
            $longitude: numeric
            $location_radius: numeric
        ) {
            update_campaigns_by_pk(
                pk_columns: { id: $id }
                _set: {
                    title: $title
                    description: $description
                    suggested_lowest_threshold: $lo
                    suggested_optimal_threshold: $opt
                    suggested_highest_threshold: $hi
                    language: $language
                    country: $country
                    location_name: $location_name
                    latitude: $latitude
                    longitude: $longitude
                    location_radius: $location_radius
                }
            ) {
                id
            }
        }
    `;

    async function save(): Promise<void> {
        saving = true;
        error = false;
        try {
            const res = await client
                .mutation(UPDATE, {
                    id: campaign.id,
                    title,
                    description,
                    lo: suggested_lowest_threshold,
                    opt: suggested_optimal_threshold,
                    hi: suggested_highest_threshold,
                    language,
                    country: country || null,
                    location_name: latitude != null ? location_name : null,
                    latitude,
                    longitude,
                    location_radius: latitude != null ? location_radius : null,
                })
                .toPromise();
            if (res.error || !res.data?.update_campaigns_by_pk) {
                error = true;
            } else {
                dispatch('saved');
            }
        } catch (e) {
            console.error('campaign update failed', e);
            error = true;
        } finally {
            saving = false;
        }
    }
</script>

<div class="edit-wrap">
    <h3 class="mt-0">{$t('edit.title')}</h3>

    <div class="flex flex-col gap-4">
        <label class="form-control w-full">
            <span class="label-text font-medium mb-1 block">{$t('addc.form_title')}</span>
            <input class="input input-bordered w-full" type="text" bind:value={title} required />
        </label>

        <label class="form-control w-full">
            <span class="label-text font-medium mb-1 block">{$t('addc.description')}</span>
            <textarea class="textarea textarea-bordered w-full" rows="6" bind:value={description}></textarea>
        </label>

        <div>
            <span class="label-text font-medium mb-1 block">{$t('addc.thresholds')}</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label class="form-control">
                    <input class="input input-bordered w-full" type="number" min="1" bind:value={suggested_lowest_threshold} />
                    <span class="label-text-alt opacity-60 mt-1 block">{$t('addc.min_hint')}</span>
                </label>
                <label class="form-control">
                    <input class="input input-bordered w-full" type="number" min="1" bind:value={suggested_optimal_threshold} />
                    <span class="label-text-alt opacity-60 mt-1 block">{$t('addc.default_hint')}</span>
                </label>
                <label class="form-control">
                    <input class="input input-bordered w-full" type="number" min="1" bind:value={suggested_highest_threshold} />
                    <span class="label-text-alt opacity-60 mt-1 block">{$t('addc.max_hint')}</span>
                </label>
            </div>
        </div>

        <label class="form-control w-full">
            <span class="label-text font-medium mb-1 block">{$t('lang.field')}</span>
            <select class="select select-bordered w-full sm:w-56" bind:value={language}>
                <option value="en">{$t('lang.en')}</option>
                <option value="cs">{$t('lang.cs')}</option>
            </select>
        </label>

        <label class="form-control w-full">
            <span class="label-text font-medium mb-1 block">{$t('country.field')}</span>
            <select class="select select-bordered w-full sm:w-56" bind:value={country}>
                {#each COUNTRIES as c}
                    <option value={c.code}>{$t(c.label_key)}</option>
                {/each}
                <option value="">{$t('country.global')}</option>
            </select>
        </label>

        <div>
            <span class="label-text font-medium mb-1 block">{$t('loc.section')}</span>
            <LocationPicker bind:latitude bind:longitude bind:location_name bind:location_radius />
        </div>
    </div>

    {#if error}
        <div class="alert alert-error mt-4"><span>{$t('edit.error')}</span></div>
    {/if}

    <div class="mt-5 flex gap-2">
        <button class="btn btn-primary" type="button" on:click={save} disabled={saving}>
            {saving ? $t('edit.saving') : $t('edit.save')}
        </button>
        <button class="btn btn-ghost" type="button" on:click={() => dispatch('cancel')} disabled={saving}>
            {$t('edit.cancel')}
        </button>
    </div>
</div>

<style>
    .edit-wrap {
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        padding: 1.5rem;
        background: color-mix(in oklab, var(--color-base-200) 40%, transparent);
    }
</style>
