<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';

    export let isOpen = false;
    export let direction = 'down';

    const dispatch = createEventDispatcher();

    let dropdownElement: HTMLElement;

    function handleClickOutside(event: MouseEvent) {
        if (isOpen && dropdownElement && !dropdownElement.contains(event.target as Node)) {
            isOpen = false;
            dispatch('toggle', { isOpen });
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });

    function toggle() {
        isOpen = !isOpen;
        console.log('Dropdown toggled:', isOpen);
        dispatch('toggle', { isOpen });
    }
</script>

<div class="dropdown {direction}" bind:this={dropdownElement}>
    <slot name="toggle" {toggle}></slot>
    {#if isOpen}
        <div class="dropdown-menu-container">
            <slot name="menu"></slot>
        </div>
    {/if}
</div>

<style>
    .dropdown {
        position: relative;
        display: inline-block;
        overflow: visible !important;
    }

    .dropdown-menu-container {
        position: static;
        z-index: 2000; /* Match the dropdown menu z-index */
        overflow: visible !important;
    }
</style>
