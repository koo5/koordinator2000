<script lang="ts">
    import { t, locale } from '$lib/i18n';
    import MutationForm from './MutationForm.svelte';
    import gql from 'graphql-tag';
    import { my_user } from '$lib/client/my_user.ts';
    import { get } from 'svelte/store';
    import TagManager from './TagManager.svelte';
    import LocationPicker from './LocationPicker.svelte';

    const ADD = gql`
        mutation MyMutation($description: String = "", $maintainer_id: Int, $title: String = "", $suggested_lowest_threshold: bigint, $suggested_highest_threshold: bigint, $suggested_optimal_threshold: bigint, $location_name: String, $latitude: numeric, $longitude: numeric, $location_radius: numeric, $language: String) {
            insert_campaigns_one(object: { description: $description, maintainer_id: $maintainer_id, title: $title, suggested_lowest_threshold: $suggested_lowest_threshold, suggested_highest_threshold: $suggested_highest_threshold, suggested_optimal_threshold: $suggested_optimal_threshold, location_name: $location_name, latitude: $latitude, longitude: $longitude, location_radius: $location_radius, language: $language }) {
                id
            }
        }
    `;

    let title = '';
    let description = '';
    let suggested_lowest_threshold = 1;
    let suggested_highest_threshold = 10000;
    let suggested_optimal_threshold = 100;
    let selectedTags: Array<{ id: number; name: string }> = [];
    let newCampaignId: number | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;
    let location_name: string | null = null;
    let location_radius: number | null = 50;
    let language: string = get(locale);

    function clearForm() {
        title = '';
        description = '';
        suggested_lowest_threshold = 1;
        suggested_highest_threshold = 10000;
        suggested_optimal_threshold = 100;
        selectedTags = [];
        newCampaignId = null;
        latitude = null;
        longitude = null;
        location_name = null;
        location_radius = 50;
    }
</script>

<div class="add-wrap">
    <MutationForm
        mutation={ADD}
        variables={{
            title,
            description,
            maintainer_id: get(my_user).id,
            suggested_lowest_threshold,
            suggested_highest_threshold,
            suggested_optimal_threshold,
            location_name,
            latitude,
            longitude,
            location_radius: latitude != null ? location_radius : null,
            language,
        }}
        on:done={event => {
            const result = event.detail;
            if (result && result.data && result.data.insert_campaigns_one) {
                // Save the ID of the newly created campaign
                newCampaignId = result.data.insert_campaigns_one.id;
            } else {
                // Reset form on error or unknown response
                clearForm();
            }
        }}
    >
        <h2 class="mt-0">{$t('addc.title')}</h2>
        <p class="text-sm opacity-70 mt-1 mb-5">{$t('addc.subtitle')}</p>

        <div class="flex flex-col gap-4">
            <label class="form-control w-full">
                <span class="label-text font-medium mb-1 block">{$t('addc.form_title')}</span>
                <input class="input input-bordered w-full" type="text" bind:value={title} placeholder={$t('addc.title_placeholder')} required />
            </label>

            <label class="form-control w-full">
                <span class="label-text font-medium mb-1 block">{$t('addc.description')}</span>
                <textarea class="textarea textarea-bordered w-full" rows="6" bind:value={description} placeholder={$t('addc.desc_placeholder')}></textarea>
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
                <span class="label-text-alt opacity-60 mt-1 block">{$t('lang.hint')}</span>
            </label>
        </div>

        <div class="mt-4">
            <span class="label-text font-medium mb-1 block">{$t('loc.section')}</span>
            <p class="text-xs opacity-60 mt-0 mb-2">{$t('loc.hint')}</p>
            <LocationPicker bind:latitude bind:longitude bind:location_name bind:location_radius />
        </div>

        {#if newCampaignId}
            <div class="alert alert-success mt-5">
                <span>{$t('addc.created')}</span>
            </div>
            <div class="mt-4">
                <h4 class="mt-0">{$t('addc.add_tags')}</h4>
                <TagManager campaignId={newCampaignId} tags={[]} allowAdd={true} showAddForm={true} />
                <div class="mt-4 flex gap-2">
                    <a href="/campaign/{newCampaignId}" class="btn btn-primary btn-sm">{$t('addc.view')}</a>
                    <button type="button" class="btn btn-ghost btn-sm" on:click={clearForm}>{$t('addc.another')}</button>
                </div>
            </div>
        {:else}
            <button class="btn btn-primary mt-5" type="submit">{$t('addc.submit')}</button>
        {/if}
    </MutationForm>
</div>

<style>
    .add-wrap {
        max-width: 40rem;
        margin: 0 auto;
        background: var(--color-base-100);
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        padding: 1.75rem;
    }
</style>
