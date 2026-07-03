<script lang="ts">
    /**
     * Shared bottom action bar ("toast") for optimistic actions: non-blocking,
     * bottom-of-screen (least obstructive), slides in/out. Content comes from the
     * slot; use <span class="toast-msg"> for text and <button class="link"> for
     * actions (Undo / Adjust / bulk) — styled here via :global.
     */
    import { fly } from 'svelte/transition';
</script>

<!-- Outer wrapper centers without transforms so the fly transition can own them. -->
<div class="toast-wrap" aria-live="polite">
    <div class="toastbar" role="status" transition:fly={{ y: 24, duration: 180 }}>
        <slot />
    </div>
</div>

<style>
    .toast-wrap {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 1rem;
        display: flex;
        justify-content: center;
        z-index: 50;
        pointer-events: none;
    }
    .toastbar {
        pointer-events: auto;
        background: var(--color-neutral);
        color: var(--color-neutral-content);
        border-radius: 0.6rem;
        padding: 0.6rem 1rem;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        max-width: 92vw;
    }
    .toastbar :global(.toast-msg) {
        font-size: 0.95rem;
    }
    .toastbar :global(button.link) {
        background: none;
        border: none;
        color: color-mix(in oklab, var(--color-info) 70%, white);
        cursor: pointer;
        font-weight: 600;
        padding: 0;
    }
    .toastbar :global(input.adj) {
        width: 6rem;
        border-radius: 0.3rem;
        border: none;
        padding: 0.2rem 0.4rem;
    }
</style>
