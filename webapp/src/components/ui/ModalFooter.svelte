<script lang="ts">
    // Add a simple script block to make this a proper component
</script>

<div class="modal-footer" {...$$restProps}>
    <slot />
</div>

<style>
    .modal-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        padding: 0.75rem;
        border-top: 1px solid #dee2e6;
        border-bottom-right-radius: calc(0.3rem - 1px);
        border-bottom-left-radius: calc(0.3rem - 1px);
    }

    /* Apply margin to any direct children of modal-footer */
    :global(.modal-footer > *) {
        margin: 0.25rem;
    }
</style>
