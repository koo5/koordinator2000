<div class="row" {...$$restProps}>
    <slot />
</div>

<style>
    .row {
        display: flex;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -15px;
        margin-top: 0;
        margin-bottom: 0;
        overflow: visible !important; /* Allow dropdowns to be visible */
    }
</style>
