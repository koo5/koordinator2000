<script lang="ts">
    import { getContextClient, gql, queryStore } from '$lib/urql.ts';
    import { my_user } from '$lib/client/my_user.ts';
    import CampaignList from './CampaignList.svelte';
    import * as animateScroll from 'svelte-scrollto';
    import { browser } from '$app/environment';
    import { debug } from '$lib/stores';
    import { onMount, tick } from 'svelte';
    import { slide } from 'svelte/transition';
    import { localStorageSharedStore } from '$lib/client/svelte-shared-store.ts';
    import { Button, FormGroup, Input, Label } from './ui';
    
    // Filter panel state - collapsed by default
    let isFilterPanelOpen = false;

    const client = getContextClient();

    interface CampaignListResult {
        campaigns: Array<{
            id: number;
            title: string;
            description: string;
            created_at: string;
            updated_at: string;
            last_activity_at: string;
            location_name: string | null;
            latitude: number | null;
            longitude: number | null;
            tags: Array<{
                tag: {
                    id: number;
                    name: string;
                };
            }>;
            participant_count: number;
        }>;
        tags: Array<{
            id: number;
            name: string;
            description: string;
        }>;
    }

    interface QueryVariables {
        _user_id: number;
        _seen_ids: number[];
        _search_term: string;
        _tag_ids: number[];
        _limit: number;
        _order_by: object[];
        _near_lat: number | null;
        _near_lng: number | null;
        _max_distance: number | null;
    }

    // Define search filter options
    interface SearchFilters {
        searchTerm: string;
        selectedTagIds: number[];
        itemsPerPage: number;
        sortBy: string;
        viewMode: string;
        liveUpdates: boolean;
        nearLat: number | null;
        nearLng: number | null;
        maxDistance: number | null;
    }

    // Initialize shared store with default values
    const searchFiltersStore = localStorageSharedStore<SearchFilters>('campaign-search-filters', {
        searchTerm: '',
        selectedTagIds: [],
        itemsPerPage: 5,
        sortBy: 'participant_count',
        viewMode: 'details',
        liveUpdates: true,
        nearLat: null,
        nearLng: null,
        maxDistance: 50,
    });

    // Local reactive variables bound to the UI
    let searchTerm = '';
    let selectedTagIds: number[] = [];
    let itemsPerPage = 5;
    let sortBy = 'participant_count';
    let viewMode = 'details';
    let liveUpdates = true;
    let nearLat: number | null = null;
    let nearLng: number | null = null;
    let maxDistance = 50;
    let showLocationFilter = false;
    let locationName = '';

    // All available tags (will be populated from GraphQL)
    let availableTags: Array<{ id: number; name: string; description: string }> = [];

    // Items per page options
    const itemsPerPageOptions = [5, 15, 50];

    // Sort options
    const sortOptions = [
        { value: 'title', label: 'Title' },
        { value: 'proximity', label: 'Proximity' },
        { value: 'participant_count', label: 'Number of Participants' },
        { value: 'created_at', label: 'Date Created' },
        { value: 'last_activity_at', label: 'Last Activity' },
    ];

    // View mode options
    const viewModes = [
        { value: 'details', label: 'Details' },
        { value: 'list', label: 'List' },
        { value: 'map', label: 'Map' },
    ];

    // Update the GraphQL query with additional filter options
    const CAMPAIGN_LIST = gql`
        query CampaignList($_user_id: Int, $_seen_ids: [Int!], $_search_term: String, $_limit: Int, $_order_by: [campaigns_order_by!]) {
            campaigns(
                order_by: $_order_by
                limit: $_limit
                where: {
                    _and: [
                        { smazano: { _eq: false } }
                        { stealth: { _eq: false } }
                        { _not: { campaign_dismissals: { account_id: { _eq: $_user_id } } } }
                        { id: { _nin: $_seen_ids } }
                        { _or: [{ title: { _ilike: $_search_term } }, { description: { _ilike: $_search_term } }] }
                        # Only apply tag filtering when tags are selected
                        #{
                        #    campaign_tags: {
                        #        tag_id: { _in: $_tag_ids }
                        #    }
                        #}

                        # To enable location filtering, uncomment and fix:
                        # {
                        #   _and: [
                        #     {latitude: {_is_null: false}},
                        #     {longitude: {_is_null: false}}
                        #   ]
                        # }
                    ]
                }
            ) {
                id
                title
                description
                created_at
                updated_at
                last_activity_at
                location_name
                latitude
                longitude
                participations_aggregate(where: { account: { smazano: { _eq: false } } }) {
                    aggregate {
                        count
                    }
                }
            }

        }
    `;

    // Function to get user's current location
    function getCurrentLocation(): void {
        if (browser && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    nearLat = position.coords.latitude;
                    nearLng = position.coords.longitude;
                    // Look up location name using a geocoding service if needed
                    locationName = 'Current Location';
                    showLocationFilter = true;
                },
                error => {
                    console.error('Error getting current location:', error);
                }
            );
        }
    }

    // Format a date for display
    function formatDate(dateString: string | null | undefined): string {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Less than 1 day ago
        if (diffDays < 1) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes === 0 ? 'Just now' : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            }
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }

        // Less than 7 days ago
        if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }

        // More than 7 days ago - show full date
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    $: my_user_id = $my_user.id;
    let items;
    let seen: number[] = [];
    $: seeing = get_seeing($items?.data?.campaigns);

    function get_seeing(campaigns: Array<{ id: number }> | undefined): number[] {
        const result: number[] = [];
        campaigns?.forEach(x => {
            result.push(x.id);
        });
        return result;
    }

    async function more(): Promise<void> {
        if (browser) {
            if (items_div) {
                animateScroll.scrollTo({ delay: 0, element: items_div });
            }
            more_button?.blur();
        }
        seen = seen.concat(seeing);
        await tick();
        search();
    }

    // Build variables for the GraphQL query
    $: searchTermWithWildcards = searchTerm ? `%${searchTerm}%` : '%%';

    // Determine the order by clause based on the selected sort option
    $: orderBy = () => {
        switch (sortBy) {
            case 'title':
                return [{ title: 'asc' }, { id: 'asc' }];
            case 'created_at':
                return [{ created_at: 'desc' }, { id: 'asc' }];
            case 'last_activity_at':
                return [{ last_activity_at: 'desc' }, { id: 'asc' }];
            case 'participant_count':
                return [{ participations_aggregate: { count: 'desc' } }, { id: 'asc' }];
            default:
                return [{ updated_at: 'desc' }, { id: 'asc' }];
        }
    };

    $: vars = {
        _user_id: my_user_id,
        _seen_ids: seen,
        _search_term: searchTermWithWildcards,
        _limit: itemsPerPage,
        _order_by: orderBy(),
        // Tag filtering variables

        // Location filter variables removed - disabled in query
    };

    // Process results to update available tags
    $: if ($items?.data) {
        if ($items.data.tags) {
            availableTags = $items.data.tags;
        }
    }

    // Function to toggle a tag selection
    function toggleTag(tagId: number): void {
        if (selectedTagIds.includes(tagId)) {
            selectedTagIds = selectedTagIds.filter(id => id !== tagId);
        } else {
            selectedTagIds = [...selectedTagIds, tagId];
        }
    }

    // Function to sync local state to localStorage
    function syncFiltersToStore(): void {
        searchFiltersStore.set({
            searchTerm,
            selectedTagIds,
            itemsPerPage,
            sortBy,
            viewMode,
            liveUpdates,
            nearLat,
            nearLng,
            maxDistance,
        });
    }

    // Apply the search with current filters
    function applySearch(): void {
        syncFiltersToStore();
        seen = []; // Reset seen items when changing filters
        search();
    }

    // Modified search function to handle conditional tag filtering
    function search(): void {
        // Only include tag filter if we have tags selected
        const queryVars = {...vars};
        console.log('search', queryVars);

        items = queryStore<CampaignListResult>({
            client,
            query: CAMPAIGN_LIST,
            variables: queryVars
        });
    }

    // Toggle location filtering
    function toggleLocationFilter(): void {
        if (!showLocationFilter) {
            getCurrentLocation();
        } else {
            showLocationFilter = false;
            nearLat = null;
            nearLng = null;
        }
    }


    // Restore filters from localStorage on mount
    onMount(() => {
        const storedFilters = $searchFiltersStore;
        searchTerm = storedFilters.searchTerm;
        selectedTagIds = storedFilters.selectedTagIds;
        itemsPerPage = storedFilters.itemsPerPage;
        sortBy = storedFilters.sortBy;
        viewMode = storedFilters.viewMode;
        liveUpdates = storedFilters.liveUpdates;
        nearLat = storedFilters.nearLat;
        nearLng = storedFilters.nearLng;
        maxDistance = storedFilters.maxDistance || 50;

        // If location filtering was enabled in the stored settings
        if (nearLat && nearLng) {
            showLocationFilter = true;
            locationName = 'Saved Location'; // Placeholder - could use reverse geocoding API to get actual name
        }

        // Start initial search
        applySearch();
    });

    let more_button: HTMLButtonElement | null = null;
    let items_div: HTMLDivElement | null = null;
</script>

<div class="content_block">
    <div class="search-header">
        <button class="btn btn-link collapse-toggle" type="button" on:click={() => isFilterPanelOpen = !isFilterPanelOpen}>
            <div class="d-flex align-items-center">
                <span>Search & Filter</span>
                <span class="toggle-icon ms-2">
                    {#if isFilterPanelOpen}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    {/if}
                </span>
            </div>
        </button>
        
        <!-- Simple search always visible -->
        <div class="d-flex search-quick-access">
            <Input type="text" id="quick-search-term" placeholder="Search titles and descriptions" bind:value={searchTerm} />
            <Button class="ml-2" color="primary" on:click={applySearch}>Search</Button>
        </div>
    </div>
    
    {#if isFilterPanelOpen}
    <div class="search-container" transition:slide={{ duration: 300 }}>
        <FormGroup>
            <Label htmlFor="search-term">Advanced Search</Label>
            <div class="d-flex">
                <Input type="text" id="search-term" placeholder="Search titles and descriptions" bind:value={searchTerm} />
                <Button class="ml-2" color="primary" on:click={applySearch}>Search</Button>
            </div>
        </FormGroup>

        <!-- Tags selector -->
        <FormGroup>
            <Label>Tags</Label>
            <div class="tags-container mb-3">
                {#if availableTags.length === 0}
                    <div class="text-muted">Loading tags...</div>
                {:else}
                    <div class="d-flex flex-wrap">
                        {#each availableTags as tag}
                            <button type="button" class="tag-badge {selectedTagIds.includes(tag.id) ? 'active' : ''}" on:click={() => toggleTag(tag.id)} on:keydown={e => e.key === 'Enter' && toggleTag(tag.id)} title={tag.description || tag.name}>
                                {tag.name}
                            </button>
                        {/each}
                    </div>
                    <div class="note mt-2">
                        <small class="text-muted">Select tags to filter campaigns</small>
                    </div>
                {/if}
            </div>
        </FormGroup>

        <!-- Location Filter -->
        <FormGroup>
            <Label>Location</Label>
            <div class="mb-3">
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="location-filter" checked={showLocationFilter} on:change={toggleLocationFilter} disabled={true} />
                    <label class="form-check-label" for="location-filter"> Enable location filter (coming soon) </label>
                </div>

            </div>
        </FormGroup>

        <div class="row">
            <div class="col-md-4">
                <FormGroup>
                    <Label>Items per page</Label>
                    <div class="d-flex">
                        {#each itemsPerPageOptions as option}
                            <div class="form-check form-check-inline mr-2">
                                <input class="form-check-input" type="radio" name="itemsPerPage" id="items-{option}" value={option} checked={itemsPerPage === option} on:change={() => (itemsPerPage = option)} />
                                <label class="form-check-label" for="items-{option}">{option}</label>
                            </div>
                        {/each}
                    </div>
                </FormGroup>
            </div>

            <div class="col-md-4">
                <FormGroup>
                    <Label htmlFor="sort-by">Sort by</Label>
                    <select class="form-select" id="sort-by" bind:value={sortBy}>
                        {#each sortOptions as option}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                </FormGroup>
            </div>

            <div class="col-md-4">
                <FormGroup>
                    <Label>View mode</Label>
                    <div class="d-flex">
                        {#each viewModes as mode}
                            <div class="form-check form-check-inline mr-2">
                                <input class="form-check-input" type="radio" name="viewMode" id="view-{mode.value}" value={mode.value} checked={viewMode === mode.value} on:change={() => (viewMode = mode.value)} />
                                <label class="form-check-label" for="view-{mode.value}">{mode.label}</label>
                            </div>
                        {/each}
                    </div>
                </FormGroup>
            </div>
        </div>

        <FormGroup>
            <Label>Live updates</Label>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="live-updates" bind:checked={liveUpdates} />
                <label class="form-check-label" for="live-updates">{liveUpdates ? 'On' : 'Off'}</label>
            </div>
        </FormGroup>

        <Button color="primary" on:click={applySearch} class="mt-3">Apply Filters</Button>
    </div>
    {/if}

    {#if $debug}
        <div class="debug-info mt-3">
            <h5>Debug Info</h5>
            <div>
                <strong>Filters:</strong>
                {JSON.stringify($searchFiltersStore, null, 2)}
            </div>
            <div>
                <strong>Seen:</strong>
                {JSON.stringify(seen, null, 2)}
            </div>
            <div>
                <strong>Seeing:</strong>
                {JSON.stringify(seeing, null, 2)}
            </div>
            <div>
                <strong>Available Tags:</strong>
                {JSON.stringify(availableTags, null, 2)}
            </div>
        </div>
    {/if}
</div>

<div bind:this={items_div} class="mt-4">
    {#if $items?.fetching}
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    {:else if $items?.error}
        <div class="alert alert-danger">
            Error loading campaigns: {$items.error.message}
        </div>
    {:else}
        <CampaignList ids={seeing} />
    {/if}
</div>

<div class="text-center mt-3 mb-5">
    <button class="btn btn-primary" bind:this={more_button} color="primary" aria-label="more..." on:click={more}> Load More </button>
</div>

<style>
    .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background-color: #f8f9fa;
        border-radius: 0.5rem;
    }
    
    .collapse-toggle {
        padding: 0.5rem 0.75rem;
        text-decoration: none;
        color: #495057;
        font-weight: 600;
    }
    
    .toggle-icon {
        transition: transform 0.3s ease;
    }
    
    .search-quick-access {
        flex-grow: 1;
        margin-left: 1rem;
        max-width: 500px;
    }
    
    .search-container {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .debug-info {
        background-color: #f0f0f0;
        padding: 1rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.875rem;
    }

    .tags-container {
        margin-top: 0.5rem;
    }

    .tag-badge {
        display: inline-block;
        background-color: #e9ecef;
        color: #495057;
        border-radius: 1rem;
        padding: 0.25rem 0.75rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
        user-select: none;
        border: none;
        font-family: inherit;
        text-align: center;
        text-decoration: none;
        line-height: 1.5;
    }

    .tag-badge:hover {
        background-color: #dee2e6;
    }

    .tag-badge:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
    }

    .tag-badge.active {
        background-color: #007bff;
        color: white;
    }
</style>
