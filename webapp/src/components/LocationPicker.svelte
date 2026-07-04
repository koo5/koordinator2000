<script lang="ts">
    /**
     * Location picker for campaign create/edit: search a place (Nominatim/OSM),
     * click the map to drop the pin, set a relevance radius, or use the
     * browser's geolocation. Two-way-bound to the four campaign location fields
     * (null = no location). Browser-only.
     */
    import { browser } from '$app/environment';
    import { onDestroy, onMount } from 'svelte';
    import { t } from '$lib/i18n';

    export let latitude: number | null = null;
    export let longitude: number | null = null;
    export let location_name: string | null = null;
    export let location_radius: number | null = 50;

    let el: HTMLDivElement;
    let map: any;
    let L: any;
    let marker: any;
    let circle: any;

    let search = '';
    let searching = false;
    let results: Array<{ display_name: string; lat: string; lon: string }> = [];

    function redraw() {
        if (!map || latitude == null || longitude == null) return;
        if (!marker) {
            marker = L.circleMarker([latitude, longitude], {
                radius: 7,
                color: '#e0533d',
                fillColor: '#e0533d',
                fillOpacity: 0.9,
                weight: 2,
            }).addTo(map);
        } else {
            marker.setLatLng([latitude, longitude]);
        }
        if (circle) circle.remove();
        if (location_radius && location_radius > 0) {
            circle = L.circle([latitude, longitude], {
                radius: location_radius * 1000,
                color: '#e0533d',
                weight: 1,
                fillOpacity: 0.08,
            }).addTo(map);
        }
    }

    function set_point(lat: number, lng: number, name: string | null = null) {
        latitude = Math.round(Number(lat) * 1e6) / 1e6;
        longitude = Math.round(Number(lng) * 1e6) / 1e6;
        if (name !== null) location_name = name;
        redraw();
    }

    function clear() {
        latitude = null;
        longitude = null;
        location_name = null;
        marker?.remove();
        circle?.remove();
        marker = circle = undefined;
    }

    async function do_search() {
        if (!search.trim()) return;
        searching = true;
        results = [];
        try {
            // Nominatim usage policy: identify via Referer (browser sends it), be gentle.
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(search.trim())}`,
                { headers: { Accept: 'application/json' } }
            );
            results = (await res.json()) || [];
        } catch (e) {
            console.error('geocoding failed', e);
        } finally {
            searching = false;
        }
    }

    function pick(r: { display_name: string; lat: string; lon: string }) {
        // Keep the name short: first two comma-parts + country (last part).
        const parts = r.display_name.split(',').map(s => s.trim());
        const name = parts.length > 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : r.display_name;
        set_point(parseFloat(r.lat), parseFloat(r.lon), name);
        results = [];
        search = '';
        map?.setView([latitude, longitude], 10);
    }

    function use_my_location() {
        if (!browser || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => {
                set_point(pos.coords.latitude, pos.coords.longitude);
                map?.setView([latitude, longitude], 11);
            },
            e => console.error('geolocation failed', e)
        );
    }

    $: if (map && location_radius != null) redraw();

    // Leaflet throws if it measures a zero-size container mid-hydration.
    function wait_for_size(node: HTMLElement): Promise<void> {
        return new Promise(resolve => {
            let tries = 0;
            const check = () => {
                if ((node.clientWidth > 0 && node.clientHeight > 0) || tries++ > 60) resolve();
                else requestAnimationFrame(check);
            };
            check();
        });
    }

    onMount(async () => {
        if (!browser) return;
        L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        await wait_for_size(el);
        if (!el.isConnected) return;

        map = L.map(el, { attributionControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        if (latitude != null && longitude != null) {
            map.setView([latitude, longitude], 10);
            redraw();
        } else {
            map.setView([49.8, 10.0], 4); // central Europe / Atlantic view fits CZ+USA audiences
        }

        map.on('click', (e: any) => set_point(e.latlng.lat, e.latlng.lng));
    });

    onDestroy(() => map?.remove());
</script>

<div class="picker">
    <div class="flex gap-2 mb-2">
        <input
            class="input input-bordered input-sm grow"
            type="search"
            placeholder={$t('loc.search_ph')}
            bind:value={search}
            on:keydown={e => e.key === 'Enter' && (e.preventDefault(), do_search())}
        />
        <button class="btn btn-sm" type="button" on:click={do_search} disabled={searching}>
            {searching ? '…' : $t('loc.search')}
        </button>
        <button class="btn btn-sm btn-ghost" type="button" on:click={use_my_location} title={$t('loc.use_mine')}>📍</button>
    </div>

    {#if results.length}
        <ul class="results">
            {#each results as r}
                <li><button type="button" on:click={() => pick(r)}>{r.display_name}</button></li>
            {/each}
        </ul>
    {/if}

    <div bind:this={el} class="map" role="application" aria-label={$t('loc.map_label')}></div>
    <p class="text-xs opacity-60 mt-1 mb-2">{$t('loc.click_hint')}</p>

    {#if latitude != null}
        <div class="flex flex-wrap items-center gap-2 text-sm">
            <span>📍 {location_name || `${latitude}, ${longitude}`}</span>
            <label class="flex items-center gap-1">
                <span class="opacity-70">{$t('loc.radius')}</span>
                <input class="input input-bordered input-xs w-20 text-center" type="number" min="1" max="20000" bind:value={location_radius} />
                <span class="opacity-70">km</span>
            </label>
            <button class="btn btn-ghost btn-xs text-error" type="button" on:click={clear}>{$t('loc.clear')}</button>
        </div>
    {/if}
</div>

<style>
    .map {
        width: 100%;
        height: 16rem;
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        overflow: hidden;
        z-index: 0;
    }
    .results {
        list-style: none;
        margin: 0 0 0.5rem;
        padding: 0.25rem;
        border: 1px solid var(--color-base-300);
        border-radius: 0.5rem;
        background: var(--color-base-100);
    }
    .results button {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 0.35rem 0.5rem;
        cursor: pointer;
        border-radius: 0.3rem;
        font-size: 0.85rem;
    }
    .results button:hover {
        background: var(--color-base-200);
    }
</style>
