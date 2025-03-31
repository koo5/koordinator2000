<script lang="ts">
    import { getContextClient, gql } from '$lib/urql.ts';
    import { onMount } from 'svelte';
    import { Button, FormGroup, Input, Label } from './ui';

    // Define props
    export let campaignId: number;
    export let tags: Array<{ id: number; name: string }> = [];
    export let readOnly: boolean = false;
    export let allowAdd: boolean = true;
    export let showAddForm: boolean = false;
    export let size: 'sm' | 'md' | 'lg' = 'md';

    // Internal state
    let availableTags: Array<{ id: number; name: string; description: string }> = [];
    let selectedTagId: number | null = null;
    let newTagName: string = '';
    let error: string | null = null;
    let success: string | null = null;
    let loading: boolean = false;

    // Set classes based on size prop
    $: badgeClass = `tag-badge ${size === 'sm' ? 'tag-sm' : size === 'lg' ? 'tag-lg' : ''}`;

    // GraphQL client
    const client = getContextClient();

    // GraphQL queries
    const GET_ALL_TAGS = gql`
        query GetAllTags {
            tags {
                id
                name
                description
            }
        }
    `;

    // GraphQL mutations
    const ADD_TAG_TO_CAMPAIGN = gql`
        mutation AddTagToCampaign($campaignId: Int!, $tagId: Int!) {
            insert_campaign_tags_one(object: { campaign_id: $campaignId, tag_id: $tagId }) {
                campaign_id
                tag_id
            }
        }
    `;

    const REMOVE_TAG_FROM_CAMPAIGN = gql`
        mutation RemoveTagFromCampaign($campaignId: Int!, $tagId: Int!) {
            delete_campaign_tags(where: { campaign_id: { _eq: $campaignId }, tag_id: { _eq: $tagId } }) {
                affected_rows
            }
        }
    `;

    const CREATE_TAG = gql`
        mutation CreateTag($name: String!, $description: String) {
            insert_tags_one(object: { name: $name, description: $description }) {
                id
                name
                description
            }
        }
    `;

    // Load all available tags on mount
    onMount(async () => {
        await loadAvailableTags();
    });

    // Function to load available tags
    async function loadAvailableTags() {
        loading = true;
        try {
            const result = await client.query(GET_ALL_TAGS, {}).toPromise();
            if (result.data && result.data.tags) {
                availableTags = result.data.tags;
            } else if (result.error) {
                error = `Error loading tags: ${result.error.message}`;
            }
        } catch (err) {
            error = `Error: ${err.message}`;
        } finally {
            loading = false;
        }
    }

    // Function to add a tag to the campaign
    async function addTagToCampaign() {
        if (!selectedTagId) {
            error = 'Please select a tag to add';
            return;
        }

        loading = true;
        error = null;
        success = null;

        try {
            const result = await client
                .mutation(ADD_TAG_TO_CAMPAIGN, {
                    campaignId,
                    tagId: selectedTagId,
                })
                .toPromise();

            if (result.data) {
                success = 'Tag added successfully';
                // Add the tag to the local tags array
                const tagToAdd = availableTags.find(t => t.id === selectedTagId);
                if (tagToAdd && !tags.some(t => t.id === tagToAdd.id)) {
                    tags = [...tags, { id: tagToAdd.id, name: tagToAdd.name }];
                }
                // Reset selection
                selectedTagId = null;
            } else if (result.error) {
                error = `Error adding tag: ${result.error.message}`;
            }
        } catch (err) {
            error = `Error: ${err.message}`;
        } finally {
            loading = false;
        }
    }

    // Function to remove a tag from the campaign
    async function removeTagFromCampaign(tagId: number) {
        if (readOnly) return;

        loading = true;
        error = null;
        success = null;

        try {
            const result = await client
                .mutation(REMOVE_TAG_FROM_CAMPAIGN, {
                    campaignId,
                    tagId,
                })
                .toPromise();

            if (result.data) {
                success = 'Tag removed successfully';
                // Remove the tag from the local tags array
                tags = tags.filter(t => t.id !== tagId);
            } else if (result.error) {
                error = `Error removing tag: ${result.error.message}`;
            }
        } catch (err) {
            error = `Error: ${err.message}`;
        } finally {
            loading = false;
        }
    }

    // Function to create a new tag
    async function createTag() {
        if (!newTagName.trim()) {
            error = 'Please enter a tag name';
            return;
        }

        loading = true;
        error = null;
        success = null;

        try {
            const result = await client
                .mutation(CREATE_TAG, {
                    name: newTagName.trim().toLowerCase(),
                    description: `User-created tag for ${newTagName}`,
                })
                .toPromise();

            if (result.data && result.data.insert_tags_one) {
                success = 'Tag created successfully';
                const newTag = result.data.insert_tags_one;

                // Add the new tag to available tags
                availableTags = [...availableTags, newTag];

                // Auto-select the new tag
                selectedTagId = newTag.id;

                // Clear the input
                newTagName = '';

                // Add the tag to the campaign
                await addTagToCampaign();
            } else if (result.error) {
                error = `Error creating tag: ${result.error.message}`;
            }
        } catch (err) {
            error = `Error: ${err.message}`;
        } finally {
            loading = false;
        }
    }

    // Computed values
    $: availableForSelection = availableTags.filter(t => !tags.some(ct => ct.id === t.id));
</script>

<!-- Display existing tags -->
<div class="tags-container">
    {#if tags.length === 0}
        <div class="no-tags">No tags</div>
    {:else}
        <div class="tag-badges">
            {#each tags as tag (tag.id)}
                <div class={badgeClass}>
                    {tag.name}
                    {#if !readOnly}
                        <button class="tag-remove-btn" on:click={() => removeTagFromCampaign(tag.id)} aria-label="Remove tag">× </button>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Tag management UI (if not read-only) -->
{#if !readOnly && allowAdd}
    <div class="tag-management my-2">
        {#if showAddForm}
            <div class="add-tag-form">
                <FormGroup>
                    <Label>Add existing tag</Label>
                    <div class="d-flex">
                        <select bind:value={selectedTagId} class="form-select">
                            <option value={null}>Select a tag</option>
                            {#each availableForSelection as tag (tag.id)}
                                <option value={tag.id}>{tag.name}</option>
                            {/each}
                        </select>
                        <Button color="primary" class="ml-2" on:click={addTagToCampaign} disabled={loading || !selectedTagId}>Add</Button>
                    </div>
                </FormGroup>

                <FormGroup class="mt-2">
                    <Label>Create new tag</Label>
                    <div class="d-flex">
                        <Input type="text" placeholder="Enter new tag name" bind:value={newTagName} />
                        <Button color="secondary" class="ml-2" on:click={createTag} disabled={loading || !newTagName.trim()}>Create</Button>
                    </div>
                </FormGroup>
            </div>
        {:else}
            <Button color="secondary" outline={true} size="sm" on:click={() => (showAddForm = true)}>+ Add Tags</Button>
        {/if}
    </div>
{/if}

<!-- Status messages -->
{#if error}
    <div class="alert alert-danger mt-2" role="alert">
        {error}
    </div>
{/if}

{#if success}
    <div class="alert alert-success mt-2" role="alert">
        {success}
    </div>
{/if}

<style>
    .tags-container {
        margin-bottom: 0.5rem;
    }

    .tag-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.25rem;
    }

    .no-tags {
        color: #6c757d;
        font-style: italic;
        font-size: 0.9rem;
    }

    .tag-badge {
        display: inline-flex;
        align-items: center;
        background-color: #e9ecef;
        color: #495057;
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
        user-select: none;
    }

    .tag-badge.tag-sm {
        font-size: 0.75rem;
        padding: 0.15rem 0.5rem;
    }

    .tag-badge.tag-lg {
        font-size: 1rem;
        padding: 0.35rem 1rem;
    }

    .tag-remove-btn {
        background: none;
        border: none;
        color: #6c757d;
        font-size: 1.1rem;
        padding: 0 0 0 0.25rem;
        margin-left: 0.25rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    .tag-remove-btn:hover {
        color: #dc3545;
    }

    .add-tag-form {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 0.375rem;
        margin-top: 0.5rem;
    }

    :global(.ml-2) {
        margin-left: 0.5rem;
    }

    :global(.my-2) {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }

    :global(.mt-2) {
        margin-top: 0.5rem;
    }
</style>
