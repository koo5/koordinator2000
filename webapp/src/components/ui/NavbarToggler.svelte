<button class="navbar-toggler" type="button" aria-expanded="false" aria-label="Toggle navigation" on:click {...$$restProps}>
    <span class="navbar-toggler-icon"></span>
</button>

<style>
    .navbar-toggler {
        font-size: 1.25rem;
        line-height: 1;
        background-color: transparent;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .navbar-toggler-icon {
        display: inline-block;
        width: 1.5em;
        height: 1.5em;
        vertical-align: middle;
        content: '';
        background: no-repeat center center;
        background-size: 100% 100%;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(0, 0, 0, 0.5)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }
</style>
