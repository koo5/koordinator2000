<div class="nav-item" {...$$restProps}>
    <slot />
</div>

<style>
    .nav-item {
        display: list-item;
        text-align: -webkit-match-parent;
        white-space: nowrap;
        overflow: visible;
    }

    @media (min-width: 768px) {
        .nav-item {
            margin-right: 0.5rem;
        }
    }
</style>
