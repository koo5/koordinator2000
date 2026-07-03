<script lang="ts">
    /**
     * Desktop discovery: a lazy-loaded vertical listing of the detailed
     * <Campaign> cards (pledge via the card's own control). Dismiss hides a card;
     * an IntersectionObserver at the bottom asks the parent for the next page.
     * Mobile uses CampaignSwiper instead (see CampaignList).
     */
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { flip } from 'svelte/animate';
    import { scale } from 'svelte/transition';
    import Campaign from './Campaign.svelte';
    import ActionToast from './ActionToast.svelte';
    import { my_user } from '$lib/client/my_user.ts';
    import { getUserRoleClient, gql } from '$lib/urql.ts';

    export let items: { campaigns?: any[] } | any;
    export let ids: number[] = [];

    const dispatch = createEventDispatcher();
    const client = getUserRoleClient();

    const DISMISS = gql`
        mutation ($campaign_id: Int, $account_id: Int) {
            insert_campaign_dismissals_one(object: { campaign_id: $campaign_id, account_id: $account_id }) { campaign_id }
        }`;
    const UNDO_DISMISS = gql`
        mutation ($campaign_id: Int, $account_id: Int) {
            delete_campaign_dismissals(where: { campaign_id: { _eq: $campaign_id }, account_id: { _eq: $account_id } }) { affected_rows }
        }`;

    function sort_by_ids(order: number[], campaigns: any[]): any[] {
        const by_id: Record<number, any> = {};
        (campaigns || []).forEach(c => (by_id[c.id] = c));
        return order.map(id => by_id[id]).filter(Boolean);
    }
    $: deck = sort_by_ids(ids, items?.campaigns || []);

    let removed = new Set<number>();
    let last_dismissed: number | null = null;
    $: visible = deck.filter(c => !removed.has(c.id));

    async function dismiss(c: any) {
        removed = new Set([...removed, c.id]);
        last_dismissed = c.id;
        try {
            await client.mutation(DISMISS, { campaign_id: c.id, account_id: $my_user.id }).toPromise();
        } catch (e) {
            console.error('dismiss failed', e);
        }
    }
    async function undo_dismiss() {
        if (last_dismissed == null) return;
        const id = last_dismissed;
        last_dismissed = null;
        await client.mutation(UNDO_DISMISS, { campaign_id: id, account_id: $my_user.id }).toPromise().catch(() => {});
        removed = new Set([...removed].filter(x => x !== id));
    }

    // Lazy load: fire loadmore when the bottom sentinel nears the viewport.
    let sentinel: HTMLElement;
    let observer: IntersectionObserver;
    onMount(() => {
        observer = new IntersectionObserver(entries => entries.some(e => e.isIntersecting) && dispatch('loadmore'), {
            rootMargin: '800px',
        });
        if (sentinel) observer.observe(sentinel);
    });
    onDestroy(() => observer?.disconnect());
</script>

<div class="campaign-listing">
    {#each visible as campaign (campaign.id)}
        <div class="listing-item" animate:flip={{ duration: 260 }} out:scale={{ duration: 220, start: 0.96 }}>
            <button class="dismiss-btn" title="Not interested" on:click={() => dismiss(campaign)}>✕ Not interested</button>
            <Campaign {campaign} on:my_participation_upsert />
        </div>
    {/each}
    <div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>
</div>

{#if last_dismissed != null}
    <ActionToast>
        <span class="toast-msg">Dismissed.</span>
        <button class="link" on:click={undo_dismiss}>Undo</button>
    </ActionToast>
{/if}

<style>
    .campaign-listing {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 48rem;
        margin: 0 auto;
    }
    .listing-item {
        position: relative;
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        padding: 1rem 1.25rem;
        background: var(--color-base-100);
    }
    .dismiss-btn {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        z-index: 2;
        background: var(--color-base-200);
        border: 1px solid var(--color-base-300);
        color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
        border-radius: 1rem;
        padding: 0.2rem 0.7rem;
        font-size: 0.8rem;
        cursor: pointer;
    }
    .dismiss-btn:hover {
        background: color-mix(in oklab, var(--color-error) 14%, transparent);
        color: var(--color-error);
    }
    .sentinel {
        height: 1px;
    }
</style>
