<script lang="ts">
    import { t, tp, locale } from '$lib/i18n';
    import { getContextClient, gql, queryStore } from '$lib/urql.ts';
    import { my_user } from '$lib/client/my_user.ts';
    import CampaignList from './CampaignList.svelte';
    import { browser } from '$app/environment';
    import { debug } from '$lib/stores';
    import { onMount, tick } from 'svelte';
    import { localStorageSharedStore } from '$lib/client/svelte-shared-store.ts';

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

    // Persisted search state (extra legacy keys in localStorage are ignored)
    interface SearchFilters {
        searchTerm: string;
        selectedTagIds: number[];
        sortBy: string;
        [key: string]: any;
    }

    const searchFiltersStore = localStorageSharedStore<SearchFilters>('campaign-search-filters', {
        searchTerm: '',
        selectedTagIds: [],
        sortBy: 'participant_count',
    });

    // Local reactive variables bound to the UI
    let searchTerm = '';
    let selectedTagIds: number[] = [];
    let sortBy = 'participant_count';
    const itemsPerPage = 10; // page size for lazy loading (not a user knob)

    // All available tags (will be populated from GraphQL)
    let availableTags: Array<{ id: number; name: string; description: string }> = [];

    // "Near me" filter (session-only — coordinates are not persisted).
    let near_on = false;
    let nearLat: number | null = null;
    let nearLng: number | null = null;
    let nearKm = 100;

    // Language relevance: default the deck to the viewer's UI language (plus
    // language-agnostic campaigns); a toggle opens it to every language.
    let show_all_languages = false;

    // Great-circle distance (km) for client-side "nearest" ordering.
    function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
        const R = 6371;
        const dLat = ((bLat - aLat) * Math.PI) / 180;
        const dLng = ((bLng - aLng) * Math.PI) / 180;
        const s =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(s));
    }

    function toggle_near(): void {
        if (near_on) {
            near_on = false;
            if (sortBy === 'distance') sortBy = 'participant_count';
            applySearch();
            return;
        }
        if (!browser || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => {
                nearLat = pos.coords.latitude;
                nearLng = pos.coords.longitude;
                near_on = true;
                applySearch();
            },
            e => {
                console.error('geolocation failed', e);
                alert($t('near.denied'));
            }
        );
    }

    const sortOptions = [
        { value: 'participant_count', key: 'search.sort_most_pledged' },
        { value: 'last_activity_at', key: 'search.sort_recent' },
        { value: 'created_at', key: 'search.sort_newest' },
        { value: 'title', key: 'search.sort_title' },
    ];

    // The where-clause is built in JS (see `vars` below) and passed as a
    // variable, so search + tag filters compose cleanly (tag filter only
    // applies when tags are actually selected). `tags` is fetched here to
    // populate the tag picker.
    const CAMPAIGN_LIST = gql`
        query CampaignList($_where: campaigns_bool_exp, $_limit: Int, $_order_by: [campaigns_order_by!]) {
            campaigns(order_by: $_order_by, limit: $_limit, where: $_where) {
                id
                title
                description
                created_at
                updated_at
                last_activity_at
                location_name
                latitude
                longitude
                language
                participations_aggregate(where: { account: { smazano: { _eq: false } } }) {
                    aggregate {
                        count
                    }
                }
            }
            tags(order_by: { name: asc }) {
                id
                name
                description
            }
        }
    `;

    $: my_user_id = $my_user?.id || -1; // Ensure we have a valid integer even for anonymous users
    let items;
    let seen: number[] = [];
    $: effectiveLimit = near_on ? 200 : itemsPerPage;
    $: campaigns_raw = $items?.data?.campaigns ?? [];
    $: seeing = get_seeing(campaigns_raw);
    // The full loaded deck (all pages so far), deduped, passed to the view. When
    // sorting by distance under "near me", order the loaded rows client-side (the
    // box already bounds them, so this is globally correct).
    $: loaded_ids = build_loaded_ids(seen, campaigns_raw);
    // Another page is likely if the latest batch filled the page size.
    $: has_more = seeing.length >= effectiveLimit;

    function build_loaded_ids(seen_ids: number[], campaigns: any[]): number[] {
        let ordered = campaigns;
        if (near_on && sortBy === 'distance' && nearLat != null && nearLng != null) {
            ordered = [...campaigns]
                .filter(c => c.latitude != null && c.longitude != null)
                .sort(
                    (a, b) =>
                        haversine(nearLat!, nearLng!, Number(a.latitude), Number(a.longitude)) -
                        haversine(nearLat!, nearLng!, Number(b.latitude), Number(b.longitude))
                );
        }
        return [...new Set([...seen_ids, ...ordered.map(c => c.id)])];
    }

    function get_seeing(campaigns: Array<{ id: number }> | undefined): number[] {
        const result: number[] = [];
        campaigns?.forEach(x => {
            result.push(x.id);
        });
        return result;
    }

    // Load the next page (lazy — appends to the deck). Guarded so overlapping
    // scroll/swipe triggers don't skip pages; uses the query's own fetching flag.
    async function more(): Promise<void> {
        if ($items?.fetching || !has_more) return;
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

    // Build the campaigns_bool_exp here so filters compose. Referencing the
    // reactive vars directly keeps Svelte's dependency tracking working.
    $: vars = {
        _where: {
            _and: [
                { smazano: { _eq: false } },
                { stealth: { _eq: false } },
                { _not: { campaign_dismissals: { account_id: { _eq: my_user_id } } } },
                { id: { _nin: seen } },
                { _or: [{ title: { _ilike: searchTermWithWildcards } }, { description: { _ilike: searchTermWithWildcards } }] },
                ...(selectedTagIds.length > 0 ? [{ campaign_tags: { tag_id: { _in: selectedTagIds } } }] : []),
                // Language relevance: viewer's language + language-agnostic rows.
                ...(show_all_languages ? [] : [{ _or: [{ language: { _eq: $locale } }, { language: { _is_null: true } }] }]),
                // "Near me": bounding-box approximation of the chosen distance
                // (composes with everything above; excludes location-less campaigns).
                ...(near_on && nearLat != null && nearLng != null
                    ? [
                          { latitude: { _gte: nearLat - nearKm / 111, _lte: nearLat + nearKm / 111 } },
                          {
                              longitude: {
                                  _gte: nearLng - nearKm / (111 * Math.max(0.2, Math.cos((nearLat * Math.PI) / 180))),
                                  _lte: nearLng + nearKm / (111 * Math.max(0.2, Math.cos((nearLat * Math.PI) / 180))),
                              },
                          },
                      ]
                    : []),
            ],
        },
        _limit: effectiveLimit,
        _order_by: orderBy(),
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
            sortBy,
        });
    }

    // Apply the search with current filters. Awaits a tick so the reactive
    // `vars` (searchTerm/selectedTagIds/sortBy) recompute before querying —
    // otherwise an immediate-apply control (tag chip, sort select) searches
    // with the PREVIOUS filter state.
    async function applySearch(): Promise<void> {
        syncFiltersToStore();
        seen = []; // Reset seen items when changing filters
        await tick();
        search();
    }

    // Modified search function to handle conditional tag filtering
    function search(): void {
        // Only include tag filter if we have tags selected
        const queryVars = {...vars};
        console.log('campaign search', queryVars);

        items = queryStore<CampaignListResult>({
            client,
            query: CAMPAIGN_LIST,
            variables: queryVars
        });
    }


    // Restore filters from localStorage on mount (legacy extra keys are ignored)
    onMount(() => {
        const storedFilters = $searchFiltersStore;
        searchTerm = storedFilters.searchTerm || '';
        selectedTagIds = Array.isArray(storedFilters.selectedTagIds) ? storedFilters.selectedTagIds : [];
        sortBy = storedFilters.sortBy || 'participant_count';

        // Start initial search
        applySearch();
    });

    let more_button: HTMLButtonElement | null = null;
    let items_div: HTMLDivElement | null = null;
</script>

<div class="content_block">
    <!-- Compact discovery toolbar: search + sort, tag chips below. Everything
         applies immediately — no separate "apply" step. -->
    <form class="toolbar" on:submit|preventDefault={applySearch}>
        <input
            id="search-term"
            class="input input-bordered input-sm toolbar-search"
            type="search"
            placeholder={$t('search.placeholder')}
            bind:value={searchTerm}
            aria-label={$t('search.placeholder')}
        />
        <button class="btn btn-primary btn-sm" type="submit">{$t('search.button')}</button>
        <select id="sort-by" class="select select-bordered select-sm" bind:value={sortBy} on:change={applySearch} aria-label="Sort by">
            {#each sortOptions as option}
                <option value={option.value}>{$t(option.key)}</option>
            {/each}
            {#if near_on}
                <option value="distance">{$t('search.sort_nearest')}</option>
            {/if}
        </select>
        <button
            type="button"
            class="btn btn-sm"
            class:btn-secondary={near_on}
            class:btn-ghost={!near_on}
            on:click={toggle_near}
        >
            {near_on ? $t('near.on', { km: nearKm }) : $t('near.button')}
        </button>
        {#if near_on}
            <select
                class="select select-bordered select-sm w-24"
                bind:value={nearKm}
                on:change={applySearch}
                aria-label="Distance"
            >
                {#each [25, 100, 500] as km}
                    <option value={km}>{km} km</option>
                {/each}
            </select>
        {/if}
        <button
            type="button"
            class="btn btn-sm"
            class:btn-secondary={show_all_languages}
            class:btn-ghost={!show_all_languages}
            on:click={() => {
                show_all_languages = !show_all_languages;
                applySearch();
            }}
            title={show_all_languages ? $t('deck.all_languages') : $t('deck.my_language', { lang: $t('lang.' + $locale) })}
        >
            {show_all_languages ? $t('deck.all_languages') : $t('deck.my_language', { lang: $t('lang.' + $locale) })}
        </button>
    </form>

    {#if availableTags.length}
        <div class="tagbar" role="group" aria-label="Filter by tag">
            {#each availableTags as tag}
                <button
                    type="button"
                    class="tag-badge"
                    class:active={selectedTagIds.includes(tag.id)}
                    on:click={() => {
                        toggleTag(tag.id);
                        applySearch();
                    }}
                    title={tag.description || tag.name}
                >
                    {tag.name}
                </button>
            {/each}
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
    {#if $items?.error}
        <div class="alert alert-error">
            Error loading campaigns: {$items.error.message}
        </div>
    {:else if loaded_ids.length}
        <!-- Persist the view across page loads; it lazy-loads more via on:loadmore. -->
        <CampaignList ids={loaded_ids} on:loadmore={more} />
    {:else if $items?.fetching}
        <div class="text-center py-8">
            <span class="loading loading-spinner loading-lg" role="status" aria-label="Loading"></span>
        </div>
    {:else}
        <p class="text-center opacity-60">{$t('search.no_match')}</p>
    {/if}
</div>

{#if has_more}
<!-- Fallback pager; hidden on mobile where the swipe deck auto-loads. -->
<div class="text-center mt-3 mb-5 hidden md:block">
    <button class="btn btn-outline btn-primary btn-sm" bind:this={more_button} aria-label="more..." on:click={more}>{$t('search.load_more')}</button>
</div>
{/if}

<style>
    .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        max-width: 48rem;
        margin: 0 auto;
    }
    .toolbar-search {
        flex: 1 1 12rem;
        min-width: 10rem;
    }
    .tagbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        justify-content: center;
        margin: 0.75rem auto 0;
        max-width: 48rem;
    }

    .debug-info {
        background-color: var(--color-base-200);
        padding: 1rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.875rem;
    }

    .tag-badge {
        display: inline-block;
        background-color: color-mix(in oklab, var(--color-secondary) 10%, transparent);
        color: var(--color-secondary);
        border-radius: 1rem;
        padding: 0.2rem 0.7rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.85rem;
        font-weight: 600;
        user-select: none;
        border: none;
        font-family: inherit;
        text-align: center;
        text-decoration: none;
    }

    .tag-badge:hover {
        background-color: color-mix(in oklab, var(--color-secondary) 20%, transparent);
    }

    .tag-badge:focus {
        outline: 2px solid var(--color-secondary);
        outline-offset: 2px;
    }

    .tag-badge.active {
        background-color: var(--color-secondary);
        color: white;
    }
</style>
