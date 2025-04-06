<script lang="ts">
    export let href: string = '#';
    export let active: boolean = false;
    export let onClick: (() => void) | undefined = undefined;

    // Forward the click event when href is not set explicitly
    function handleClick(event: MouseEvent): void {
        console.log('NavLink clicked');
        if (onClick) {
            onClick();
        }
    }
</script>

<a {href} class="nav-link {active ? 'active' : ''}" on:click={handleClick}>
    <slot />
</a>

<style>
    .nav-link {
        display: block;
        padding: 0.5rem 1rem;
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
        transition: color 0.15s ease-in-out;
    }

    .nav-link:hover {
        color: #0056b3;
        text-decoration: none;
    }

    .active {
        color: #212529;
        font-weight: bold;
    }
</style>
