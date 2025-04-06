<script lang="ts">
    export let href: string | undefined = undefined;
    export let disabled: boolean = false;
    export let onClick: (() => void) | undefined = undefined;
</script>

{#if href !== undefined}
    <a
        class="dropdown-item {disabled ? 'disabled' : ''}"
        {href}
        tabindex={disabled ? -1 : 0}
        aria-disabled={disabled}
        on:click
    >
        <slot />
    </a>
{:else}
    <button
        class="dropdown-item {disabled ? 'disabled' : ''}"
        type="button"
        disabled={disabled}
        on:click={onClick}
    >
        <slot />
    </button>
{/if}

<style>
    .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.25rem 1.5rem;
        clear: both;
        font-weight: 400;
        color: #212529;
        text-align: inherit;
        white-space: nowrap;
        background-color: transparent;
        border: 0;
        text-decoration: none;
    }

    button.dropdown-item {
        text-align: left;
        cursor: pointer;
    }

    .dropdown-item:hover:not(.disabled),
    .dropdown-item:focus:not(.disabled) {
        color: #16181b;
        text-decoration: none;
        background-color: #f8f9fa;
    }

    .dropdown-item.disabled {
        color: #6c757d;
        pointer-events: none;
        background-color: transparent;
    }
</style>
