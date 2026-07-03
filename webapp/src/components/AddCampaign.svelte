<script lang="ts">
    import MutationForm from './MutationForm.svelte';
    import gql from 'graphql-tag';
    import { my_user } from '$lib/client/my_user.ts';
    import { get } from 'svelte/store';
    import TagManager from './TagManager.svelte';

    const ADD = gql`
        mutation MyMutation($description: String = "", $maintainer_id: Int, $title: String = "", $suggested_lowest_threshold: bigint, $suggested_highest_threshold: bigint, $suggested_optimal_threshold: bigint) {
            insert_campaigns_one(object: { description: $description, maintainer_id: $maintainer_id, title: $title, suggested_lowest_threshold: $suggested_lowest_threshold, suggested_highest_threshold: $suggested_highest_threshold, suggested_optimal_threshold: $suggested_optimal_threshold }) {
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

    function clearForm() {
        title = '';
        description = '';
        suggested_lowest_threshold = 1;
        suggested_highest_threshold = 10000;
        suggested_optimal_threshold = 100;
        selectedTags = [];
        newCampaignId = null;
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
        <h2 class="mt-0">Start a campaign</h2>
        <p class="text-sm opacity-70 mt-1 mb-5">
            Describe the collective action, and suggest how many people it takes to matter.
            People pledge with their own threshold — "I'll join if N others do."
        </p>

        <div class="flex flex-col gap-4">
            <label class="form-control w-full">
                <span class="label-text font-medium mb-1 block">Title</span>
                <input class="input input-bordered w-full" type="text" bind:value={title} placeholder="e.g. Boycott MegaCorp until they drop supplier X" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text font-medium mb-1 block">Description</span>
                <textarea class="textarea textarea-bordered w-full" rows="6" bind:value={description} placeholder="What's the action, who is it aimed at, and when is the goal reached?"></textarea>
            </label>

            <div>
                <span class="label-text font-medium mb-1 block">Thresholds</span>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label class="form-control">
                        <input class="input input-bordered w-full" type="number" min="1" bind:value={suggested_lowest_threshold} />
                        <span class="label-text-alt opacity-60 mt-1 block">Minimum — below this, participating brings no effect (or risks harm)</span>
                    </label>
                    <label class="form-control">
                        <input class="input input-bordered w-full" type="number" min="1" bind:value={suggested_optimal_threshold} />
                        <span class="label-text-alt opacity-60 mt-1 block">Suggested default — the campaign goal</span>
                    </label>
                    <label class="form-control">
                        <input class="input input-bordered w-full" type="number" min="1" bind:value={suggested_highest_threshold} />
                        <span class="label-text-alt opacity-60 mt-1 block">Maximum sensible — e.g. the size of the affected community</span>
                    </label>
                </div>
            </div>
        </div>

        {#if newCampaignId}
            <div class="alert alert-success mt-5">
                <span>🎉 Campaign created!</span>
            </div>
            <div class="mt-4">
                <h4 class="mt-0">Add tags so people can find it</h4>
                <TagManager campaignId={newCampaignId} tags={[]} allowAdd={true} showAddForm={true} />
                <div class="mt-4 flex gap-2">
                    <a href="/campaign/{newCampaignId}" class="btn btn-primary btn-sm">View your campaign</a>
                    <button type="button" class="btn btn-ghost btn-sm" on:click={clearForm}>Create another</button>
                </div>
            </div>
        {:else}
            <button class="btn btn-primary mt-5" type="submit">Create campaign</button>
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
