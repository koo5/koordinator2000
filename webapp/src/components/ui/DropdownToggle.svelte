<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let color: string = "primary";
    export let toggle: (() => void) | undefined = undefined;

    function handleClick(event: MouseEvent) {
        if (toggle) {
            toggle();
        }
        dispatch('click', event);
    }
</script>

<button
    class="dropdown-toggle {color}"
    on:click|preventDefault|stopPropagation={handleClick}
    aria-expanded="false"
    aria-haspopup="true"
    type="button"
>
    <slot />
</button>

<style>
    .dropdown-toggle {
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        font: inherit;
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.75rem;
        border-radius: 0.25rem;
        text-decoration: none;
    }

    .dropdown-toggle:hover {
        text-decoration: none;
        background-color: rgba(0, 0, 0, 0.05);
    }

    .dropdown-toggle::after {
        display: inline-block;
        margin-left: 0.255em;
        vertical-align: 0.255em;
        content: "";
        border-top: 0.3em solid;
        border-right: 0.3em solid transparent;
        border-bottom: 0;
        border-left: 0.3em solid transparent;
    }
</style>