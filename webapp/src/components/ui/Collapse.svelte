<script>
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    export let isOpen = false;
    export let navbar = false;
    // Using const for reference-only exports
    export const expand = '';

    const dispatch = createEventDispatcher();

    $: if (isOpen !== undefined) {
        dispatch('update', { isOpen });
    }
</script>

{#if isOpen}
    <div class="collapse {navbar ? 'navbar-collapse' : ''}" transition:slide={{ duration: 300 }} {...$$restProps}>
        <slot />
    </div>
{/if}

<style>
    .collapse {
        display: block;
        overflow: visible !important;
    }

    .navbar-collapse {
        flex-basis: 100%;
        flex-grow: 1;
        align-items: center;
        overflow: visible !important;
    }

    @media (min-width: 768px) {
        .navbar-collapse {
            display: flex !important;
            flex-basis: auto;
        }
    }
</style>
