<script lang="ts">
    export let right: boolean = false;
</script>

<div class="dropdown-menu {right ? 'dropdown-menu-right' : ''}">
    <slot />
</div>

<style>
    .dropdown-menu {
        position: absolute;
        z-index: 2000; /* Significantly increased z-index to appear above all elements */
        min-width: 10rem;
        padding: 0.5rem 0;
        margin: 0.125rem 0 0;
        font-size: 1rem;
        color: #212529;
        text-align: left;
        list-style: none;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
    }

    .dropdown-menu-right {
        right: 0;
        left: auto;
    }
</style>