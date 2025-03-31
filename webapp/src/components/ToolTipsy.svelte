<script>
    export let css_ref = '';
    export let enabled = true;
</script>

{#if enabled}
    <span class="tooltipsy">
        <slot></slot>
        <div class="tooltiptext {css_ref}">
            <slot name="tooltip">tooltip</slot>
        </div>
    </span>
{:else}
    <slot></slot>
{/if}

<!--
todo
	https://dev.to/gokayokyay/how-to-use-popper-with-svelte-in-a-sveltish-way-with-actions-2h02?utm_source=dormosheio&utm_campaign=dormosheio

-->

<style>
    .tooltipsy {
        border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
    }

    .tooltiptext {
        border-style: solid;
        visibility: hidden;
        position: absolute;
        z-index: 1;
        padding: 0em 1em;
        border: 1em 1em;
        background-color: white;
        color: black;
    }

    /* Show the tooltip text when you mouse over the tooltip container */
    .tooltipsy:hover .tooltiptext {
        visibility: visible;
    }
</style>
