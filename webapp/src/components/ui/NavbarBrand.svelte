<script>
    export let href = '/';
</script>

<a {href} class="navbar-brand" {...$$restProps}>
    <slot />
</a>

<style>
    .navbar-brand {
        display: inline-block;
        margin-right: 1rem;
        white-space: nowrap;
        text-decoration: none;
        color: inherit;
    }
</style>
