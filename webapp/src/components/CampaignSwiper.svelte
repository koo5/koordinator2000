<script lang="ts">
    /**
     * Reels-style campaign discovery. One card at a time; you sift fast.
     *   swipe up    = next (neutral skip, no record)
     *   swipe right = pledge at the campaign's default threshold
     *   swipe left  = dismiss (private; hidden from your deck)
     * Every action is optimistic (fire + advance instantly) with a non-blocking
     * bottom bar to Undo (and Adjust the pledge threshold).
     */
    import { createEventDispatcher } from 'svelte';
    import { my_user } from '$lib/client/my_user.ts';
    import { getUserRoleClient, gql } from '$lib/urql.ts';
    import { sanitize_html } from '$lib/client/campaign.ts';
    import ActionToast from './ActionToast.svelte';

    const dispatch = createEventDispatcher();
    import { browser } from '$app/environment';

    export let items: { campaigns?: any[] } | any;
    export let ids: number[] = [];

    const client = getUserRoleClient();

    const PLEDGE = gql`
        mutation ($campaign_id: Int, $threshold: Int) {
            insert_participations(
                objects: { campaign_id: $campaign_id, threshold: $threshold }
                on_conflict: { constraint: participations_campaign_id_user_id, update_columns: threshold }
            ) { affected_rows }
        }`;
    const UNDO_PLEDGE = gql`
        mutation ($campaign_id: Int, $account_id: Int) {
            delete_participations(where: { campaign_id: { _eq: $campaign_id }, account_id: { _eq: $account_id } }) { affected_rows }
        }`;
    const DISMISS = gql`
        mutation ($campaign_id: Int, $account_id: Int) {
            insert_campaign_dismissals_one(object: { campaign_id: $campaign_id, account_id: $account_id }) { campaign_id }
        }`;
    const UNDO_DISMISS = gql`
        mutation ($campaign_id: Int, $account_id: Int) {
            delete_campaign_dismissals(where: { campaign_id: { _eq: $campaign_id }, account_id: { _eq: $account_id } }) { affected_rows }
        }`;

    // --- bulk ("all of this cause / this organizer") ---
    const SIBLINGS = gql`
        query ($where: campaigns_bool_exp!) {
            campaigns(where: $where) { id suggested_optimal_threshold suggested_lowest_threshold }
        }`;
    const BULK_DISMISS = gql`
        mutation ($objects: [campaign_dismissals_insert_input!]!) {
            insert_campaign_dismissals(objects: $objects) { affected_rows }
        }`;
    const BULK_PLEDGE = gql`
        mutation ($objects: [participations_insert_input!]!) {
            insert_participations(objects: $objects, on_conflict: { constraint: participations_campaign_id_user_id, update_columns: threshold }) { affected_rows }
        }`;
    const UNDO_BULK = gql`
        mutation ($ids: [Int!]!, $me: Int!, $pledge: Boolean!, $dismiss: Boolean!) {
            d: delete_participations(where: { campaign_id: { _in: $ids }, account_id: { _eq: $me } }) @include(if: $pledge) { affected_rows }
            x: delete_campaign_dismissals(where: { campaign_id: { _in: $ids }, account_id: { _eq: $me } }) @include(if: $dismiss) { affected_rows }
        }`;

    // --- deck (sorted to the order the parent computed) ---
    function sort_by_ids(order: number[], campaigns: any[]): any[] {
        const by_id: Record<number, any> = {};
        (campaigns || []).forEach(c => (by_id[c.id] = c));
        return order.map(id => by_id[id]).filter(Boolean);
    }
    $: deck = sort_by_ids(ids, items?.campaigns || []);

    // Cards removed live from the deck (bulk-dismissed siblings) — skipped, not spliced.
    let removed = new Set<number>();
    let index = 0;
    let prev_index = 0;

    function next_visible(from: number): number {
        while (from < deck.length && removed.has(deck[from]?.id)) from++;
        return from;
    }
    // Keep `index` pointing at a visible card if the current one got bulk-removed.
    $: if (deck.length && index < deck.length && removed.has(deck[index]?.id)) index = next_visible(index);

    $: current = deck[index];
    $: done = deck.length > 0 && next_visible(index) >= deck.length;

    // The visible 3-card stack, keyed by id: because the DOM nodes persist when a
    // card moves from depth-1 to depth-0, the CSS transition animates the
    // promotion — the stack visibly rises while the top card exits.
    function stack_from(idx: number, dk: any[], rm: Set<number>): any[] {
        const out: any[] = [];
        let j = next_visible(idx);
        while (out.length < 3 && j < dk.length) {
            out.push(dk[j]);
            j = next_visible(j + 1);
        }
        return out;
    }
    $: stack_cards = stack_from(index, deck, removed);

    // Ask the parent to load the next page when we're near the end of the deck.
    function maybe_load_more() {
        if (next_visible(index + 2) >= deck.length) dispatch('loadmore');
    }

    function default_threshold(c: any): number {
        return c?.suggested_optimal_threshold || c?.suggested_lowest_threshold || 1;
    }
    function participant_count(c: any): number {
        return (c?.participations || []).length;
    }

    // --- actions (optimistic) ---
    type BulkResult = { action: 'pledge' | 'dismiss'; label: string; ids: number[] };
    type Toast = { kind: 'pledge' | 'dismiss'; campaign: any; threshold: number; bulk?: BulkResult } | null;
    let toast: Toast = null;
    let toast_timer: ReturnType<typeof setTimeout> | undefined;
    let exiting: '' | 'left' | 'right' | 'up' = '';
    let busy = false;

    function show_toast(t: Toast) {
        toast = t;
        clearTimeout(toast_timer);
        toast_timer = setTimeout(() => (toast = null), 6000);
    }

    async function do_pledge(c: any, threshold: number) {
        try {
            await client.mutation(PLEDGE, { campaign_id: c.id, threshold }).toPromise();
        } catch (e) {
            console.error('pledge failed', e);
        }
    }
    async function do_dismiss(c: any) {
        try {
            await client.mutation(DISMISS, { campaign_id: c.id, account_id: $my_user.id }).toPromise();
        } catch (e) {
            console.error('dismiss failed', e);
        }
    }

    function act(dir: 'right' | 'left' | 'up') {
        if (busy || !current) return;
        busy = true;
        const c = current;
        exiting = dir;

        if (dir === 'right') {
            const t = default_threshold(c);
            do_pledge(c, t);
            show_toast({ kind: 'pledge', campaign: c, threshold: t });
        } else if (dir === 'left') {
            do_dismiss(c);
            show_toast({ kind: 'dismiss', campaign: c, threshold: 0 });
        }
        // 'up' is a neutral skip — no record, no toast.

        prev_index = index;
        setTimeout(() => {
            index = next_visible(index + 1);
            exiting = '';
            dx = dy = 0;
            busy = false;
            maybe_load_more();
        }, 280);
    }

    async function undo() {
        if (!toast) return;
        const { kind, campaign } = toast;
        toast = null;
        clearTimeout(toast_timer);
        if (kind === 'pledge') {
            await client.mutation(UNDO_PLEDGE, { campaign_id: campaign.id, account_id: $my_user.id }).toPromise().catch(() => {});
        } else {
            await client.mutation(UNDO_DISMISS, { campaign_id: campaign.id, account_id: $my_user.id }).toPromise().catch(() => {});
        }
        index = prev_index; // bring that exact card back
    }

    // Escalate the last single action to "all of this cause / this organizer".
    async function do_bulk(scope: 'cause' | 'maintainer') {
        if (!toast) return;
        const c = toast.campaign;
        const action = toast.kind;
        const me = $my_user.id;
        const col = scope === 'cause' ? 'cause_id' : 'maintainer_id';
        const scopeId = c[col];
        if (!scopeId) return;
        const label = scope === 'cause' ? c.cause?.title || 'this cause' : c.maintainer?.name || 'this organizer';

        const not_acted =
            action === 'pledge'
                ? { _not: { participations: { account_id: { _eq: me } } } }
                : { _not: { campaign_dismissals: { account_id: { _eq: me } } } };
        const where = { [col]: { _eq: scopeId }, smazano: { _eq: false }, ...not_acted };

        try {
            const res = await client.query(SIBLINGS, { where }).toPromise();
            const rows = res.data?.campaigns || [];
            const ids = rows.map((r: any) => r.id);
            if (ids.length) {
                if (action === 'pledge') {
                    const objects = rows.map((r: any) => ({
                        campaign_id: r.id,
                        threshold: r.suggested_optimal_threshold || r.suggested_lowest_threshold || 1,
                    }));
                    await client.mutation(BULK_PLEDGE, { objects }).toPromise();
                } else {
                    await client.mutation(BULK_DISMISS, { objects: ids.map((id: number) => ({ campaign_id: id, account_id: me })) }).toPromise();
                    removed = new Set([...removed, ...ids]); // drop them from the rest of the deck now
                }
            }
            show_toast({ ...toast, bulk: { action, label, ids } });
        } catch (e) {
            console.error('bulk failed', e);
        }
    }

    async function undo_bulk() {
        if (!toast?.bulk) return;
        const { action, ids } = toast.bulk;
        const single = toast;
        toast = null;
        clearTimeout(toast_timer);
        if (ids.length) {
            await client
                .mutation(UNDO_BULK, { ids, me: $my_user.id, pledge: action === 'pledge', dismiss: action === 'dismiss' })
                .toPromise()
                .catch(() => {});
            removed = new Set([...removed].filter(id => !ids.includes(id))); // put them back in the deck
        }
        const single_mut = single.kind === 'pledge' ? UNDO_PLEDGE : UNDO_DISMISS;
        await client.mutation(single_mut, { campaign_id: single.campaign.id, account_id: $my_user.id }).toPromise().catch(() => {});
        index = prev_index; // bring the card back
    }

    let adjusting = false;
    let adjust_value = 0;
    function open_adjust() {
        if (!toast || toast.kind !== 'pledge') return;
        adjust_value = toast.threshold;
        adjusting = true;
    }
    async function save_adjust() {
        if (!toast) return;
        const t = Math.max(0, Math.floor(adjust_value) || 0);
        await client.mutation(PLEDGE, { campaign_id: toast.campaign.id, threshold: t }).toPromise().catch(() => {});
        toast = { ...toast, threshold: t };
        adjusting = false;
        show_toast(toast);
    }

    // --- gestures ---
    let dx = 0;
    let dy = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    const SWIPE = 80;

    function pointerdown(e: PointerEvent) {
        if (busy) return;
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    function pointermove(e: PointerEvent) {
        if (!dragging) return;
        dx = e.clientX - startX;
        dy = e.clientY - startY;
    }
    function pointerup() {
        if (!dragging) return;
        dragging = false;
        const horizontal = Math.abs(dx) > Math.abs(dy);
        if (horizontal && dx > SWIPE) act('right');
        else if (horizontal && dx < -SWIPE) act('left');
        else if (!horizontal && dy < -SWIPE) act('up');
        else {
            dx = dy = 0; // snap back
        }
    }

    function onkeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowRight') act('right');
        else if (e.key === 'ArrowLeft') act('left');
        else if (e.key === 'ArrowUp') act('up');
    }

    // hint overlay based on drag direction
    $: hint =
        Math.abs(dx) > Math.abs(dy)
            ? dx > 40 ? 'pledge' : dx < -40 ? 'dismiss' : ''
            : dy < -40 ? 'skip' : '';
    $: card_style = exiting
        ? exiting === 'right'
            ? 'transform: translateX(120%) rotate(12deg); opacity:0;'
            : exiting === 'left'
              ? 'transform: translateX(-120%) rotate(-12deg); opacity:0;'
              : 'transform: translateY(-120%); opacity:0;'
        : dragging
          ? `transform: translate(${dx}px, ${dy}px) rotate(${dx * 0.04}deg);`
          : 'transform: translate(0,0);';
</script>

<svelte:window on:keydown={browser ? onkeydown : undefined} />

<div class="swiper-root">
    {#if done}
        <div class="empty">
            <p>🎉 You're all caught up.</p>
            <p class="muted">Adjust your filters above, or check back later.</p>
        </div>
    {:else if current}
        <div class="deck" class:promoting={!!exiting}>
            {#each stack_cards as c, i (c.id)}
                <div
                    class="kcard depth-{i} {i === 0 && exiting ? 'exiting' : ''}"
                    class:top={i === 0}
                    class:dragging={i === 0 && dragging}
                    style={i === 0 ? card_style : ''}
                    data-campaign-id={c.id}
                    aria-hidden={i !== 0}
                    on:pointerdown={e => i === 0 && pointerdown(e)}
                    on:pointermove={e => i === 0 && pointermove(e)}
                    on:pointerup={() => i === 0 && pointerup()}
                    on:pointercancel={() => i === 0 && pointerup()}
                    role="group"
                    aria-label={c.title}
                >
                    {#if i === 0 && hint}<div class="hint {hint}">{hint === 'pledge' ? "I'M IN" : hint === 'dismiss' ? 'DISMISS' : 'SKIP'}</div>{/if}

                    <h3><a href="/campaign/{c.id}" on:pointerdown|stopPropagation>{c.title}</a></h3>
                    {#if c.tags?.length}
                        <div class="tags">{#each c.tags as t}<span class="tag">{t.tag?.name}</span>{/each}</div>
                    {/if}
                    <div class="desc">{@html sanitize_html((c.description || '').slice(0, 320))}</div>
                    <div class="meta">
                        <span>👥 {participant_count(c)} participating</span>
                        <span>· swipe right to join if <b>{default_threshold(c)}</b> others do</span>
                    </div>
                </div>
            {/each}
        </div>

        <div class="actions">
            <button class="act-btn dismiss" on:click={() => act('left')} title="Dismiss (←)">✕</button>
            <button class="act-btn skip" on:click={() => act('up')} title="Skip (↑)">↑</button>
            <button class="act-btn pledge" on:click={() => act('right')} title="Pledge (→)">✓ I'm in</button>
        </div>
    {:else}
        <div class="empty"><p>Loading campaigns…</p></div>
    {/if}

    {#if toast}
        <ActionToast>
            {#if adjusting}
                <span>Join if</span>
                <input type="number" min="0" bind:value={adjust_value} class="adj" />
                <span>others do</span>
                <button class="link" on:click={save_adjust}>Save</button>
                <button class="link" on:click={() => (adjusting = false)}>Cancel</button>
            {:else if toast.bulk}
                <span class="toast-msg">
                    {toast.bulk.action === 'pledge' ? '✅ Pledged' : 'Dismissed'} all
                    <b>{toast.bulk.ids.length}</b> of <b>{toast.bulk.label}</b>.
                </span>
                <button class="link" on:click={undo_bulk}>Undo all</button>
            {:else}
                <span class="toast-msg">
                    {#if toast.kind === 'pledge'}
                        ✅ Pledged — you'll join if <b>{toast.threshold}</b> others do.
                    {:else}
                        Dismissed <b>{toast.campaign.title}</b>.
                    {/if}
                </span>
                {#if toast.kind === 'pledge'}<button class="link" on:click={open_adjust}>Adjust</button>{/if}
                {#if toast.campaign.cause_id}
                    <button class="link" on:click={() => do_bulk('cause')}>
                        {toast.kind === 'pledge' ? 'Pledge' : 'Dismiss'} all of {toast.campaign.cause?.title || 'this cause'}
                    </button>
                {/if}
                {#if toast.campaign.maintainer_id}
                    <button class="link" on:click={() => do_bulk('maintainer')}>
                        {toast.kind === 'pledge' ? 'Pledge' : 'Dismiss'} all by {toast.campaign.maintainer?.name || 'this organizer'}
                    </button>
                {/if}
                <button class="link" on:click={undo}>Undo</button>
            {/if}
        </ActionToast>
    {/if}
</div>

<style>
    .swiper-root {
        position: relative;
        max-width: 34rem;
        margin: 0 auto;
        min-height: 26rem;
        user-select: none;
    }
    .deck {
        position: relative;
        height: 24rem;
    }
    .kcard {
        position: absolute;
        inset: 0;
        background: var(--color-base-100);
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 1rem);
        padding: 1.25rem 1.5rem;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        touch-action: pan-y;
    }
    /* Depth stack: cards behind are scaled/lowered/faded; because the keyed
       {#each} keeps DOM nodes when a card changes depth, this transition IS the
       promotion animation (the stack rises while the top card exits). */
    .kcard {
        transition: transform 0.28s ease, opacity 0.28s ease;
    }
    .kcard.depth-0 {
        cursor: grab;
        z-index: 3;
    }
    .kcard.depth-0.dragging {
        transition: none; /* follow the finger instantly */
    }
    .kcard.depth-1 {
        z-index: 2;
        transform: scale(0.955) translateY(14px);
        opacity: 0.6;
        pointer-events: none;
    }
    .kcard.depth-2 {
        z-index: 1;
        transform: scale(0.91) translateY(28px);
        opacity: 0.3;
        pointer-events: none;
    }
    /* While the top card exits, promote the cards behind in the same beat. */
    .promoting .kcard.depth-1 {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
    .promoting .kcard.depth-2 {
        transform: scale(0.955) translateY(14px);
        opacity: 0.6;
    }
    .kcard h3 {
        margin: 0 0 0.5rem;
        font-size: 1.35rem;
        line-height: 1.25;
    }
    .kcard h3 a {
        color: inherit;
        text-decoration: none;
    }
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-bottom: 0.6rem;
    }
    .tag {
        background: color-mix(in oklab, var(--color-secondary) 12%, transparent);
        color: var(--color-secondary);
        border-radius: 1rem;
        padding: 0.1rem 0.6rem;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .desc {
        color: color-mix(in oklab, var(--color-base-content) 85%, transparent);
        max-height: 12rem;
        overflow: hidden;
    }
    .meta {
        position: absolute;
        bottom: 0.9rem;
        left: 1.5rem;
        right: 1.5rem;
        font-size: 0.85rem;
        color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
    }
    .hint {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        padding: 0.2rem 0.6rem;
        border-radius: 0.4rem;
        border: 3px solid;
        z-index: 3;
    }
    .hint.pledge { color: var(--color-success); border-color: var(--color-success); transform: rotate(-8deg); }
    .hint.dismiss { color: var(--color-error); border-color: var(--color-error); left: 1rem; right: auto; transform: rotate(8deg); }
    .hint.skip { color: var(--color-info); border-color: var(--color-info); left: 50%; right: auto; transform: translateX(-50%); }
    .actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.25rem;
    }
    .act-btn {
        border: none;
        border-radius: 2rem;
        padding: 0.65rem 1.1rem;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 700;
        transition: transform 0.12s ease, filter 0.12s ease;
    }
    .act-btn:hover { transform: scale(1.06); filter: brightness(0.97); }
    .act-btn:active { transform: scale(0.96); }
    .act-btn.dismiss {
        background: color-mix(in oklab, var(--color-error) 14%, transparent);
        color: var(--color-error);
    }
    .act-btn.skip {
        background: color-mix(in oklab, var(--color-info) 14%, transparent);
        color: var(--color-info);
    }
    .act-btn.pledge {
        background: var(--color-success);
        color: var(--color-success-content);
        padding-inline: 1.5rem;
        box-shadow: 0 3px 10px color-mix(in oklab, var(--color-success) 35%, transparent);
    }
    .empty {
        text-align: center;
        padding: 4rem 1rem;
    }
    .muted { color: color-mix(in oklab, var(--color-base-content) 55%, transparent); }
</style>
