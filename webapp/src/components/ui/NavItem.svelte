<li class="nav-item" {...$$restProps}>
    <slot />
</li>

<style>
    .nav-item {
        display: list-item;
        text-align: -webkit-match-parent;
    }

    @media (min-width: 768px) {
        .nav-item {
            margin-right: 0.5rem;
        }
    }
</style>
