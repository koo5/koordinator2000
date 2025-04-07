<div class="container" {...$$restProps}>
    <slot />
</div>

<style>
    .container {
        width: 100%;
        padding-right: 15px;
        padding-left: 15px;
        padding-top: 0;
        padding-bottom: 0;
        margin-right: auto;
        margin-left: auto;
        margin-top: 0;
        margin-bottom: 0;
        max-width: 1140px;
        overflow: visible !important; /* Ensure dropdowns can appear outside container */
    }
</style>
