<script>
    export let toggle = undefined;
</script>

<div class="modal-header" {...$$restProps}>
    <h5 class="modal-title">
        <slot />
    </h5>
    {#if toggle}
        <button type="button" class="close" aria-label="Close" on:click={toggle}>
            <span aria-hidden="true">&times;</span>
        </button>
    {/if}
</div>

<style>
    .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 1rem;
        border-bottom: 1px solid #dee2e6;
        border-top-left-radius: calc(0.3rem - 1px);
        border-top-right-radius: calc(0.3rem - 1px);
    }

    .modal-title {
        margin-bottom: 0;
        line-height: 1.5;
        font-size: 1.25rem;
        font-weight: 500;
    }

    .close {
        float: right;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: 0.5;
        padding: 0;
        background-color: transparent;
        border: 0;
        appearance: none;
        cursor: pointer;
    }

    .close:hover {
        color: #000;
        text-decoration: none;
        opacity: 0.75;
    }
</style>
