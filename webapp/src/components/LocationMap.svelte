<script lang="ts">
    /**
     * Read-only campaign location: OSM tiles via Leaflet, a circle marker for
     * the point and a translucent circle for the campaign's relevance radius.
     * Browser-only (Leaflet needs window); renders nothing during SSR.
     */
    import { browser } from '$app/environment';
    import { onDestroy, onMount } from 'svelte';

    export let latitude: number;
    export let longitude: number;
    export let radius_km: number | null = null; // campaign relevance radius
    export let height = '14rem';

    // Hasura's `numeric` scalar serializes as strings — coerce so Leaflet's math
    // (project/fitBounds) works instead of silently producing no view.
    $: lat = Number(latitude);
    $: lng = Number(longitude);
    $: rad = radius_km != null ? Number(radius_km) : null;

    let el: HTMLDivElement;
    let map: any;

    // Leaflet throws (layerPointToLatLng) if it measures a zero-size container,
    // which happens while the campaign is still hydrating. Wait for real size.
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
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        await wait_for_size(el);
        if (!el.isConnected) return; // unmounted while waiting

        map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Establish a view BEFORE adding vector layers — a circle added to a
        // view-less map throws (its renderer has no _map projection yet).
        map.setView([lat, lng], 11);

        L.circleMarker([lat, lng], {
            radius: 7,
            color: '#e0533d',
            fillColor: '#e0533d',
            fillOpacity: 0.9,
            weight: 2,
        }).addTo(map);

        let circle: any = null;
        if (rad && rad > 0) {
            circle = L.circle([lat, lng], {
                radius: rad * 1000,
                color: '#e0533d',
                weight: 1,
                fillOpacity: 0.08,
            }).addTo(map);
            map.fitBounds(circle.getBounds(), { padding: [12, 12] });
        }

        // The container may still be settling when Leaflet first measures it.
        setTimeout(() => {
            map.invalidateSize();
            if (circle) map.fitBounds(circle.getBounds(), { padding: [12, 12] });
        }, 150);
    });

    onDestroy(() => map?.remove());
</script>

<div bind:this={el} class="loc-map" style="height: {height}" aria-hidden="true"></div>

<style>
    .loc-map {
        width: 100%;
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        overflow: hidden;
        z-index: 0;
    }
</style>
