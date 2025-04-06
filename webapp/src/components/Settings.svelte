<script lang="ts">
    import { my_user } from '$lib/client/my_user.ts';
    import { debug } from '$lib/stores.ts';

    const default_participations_display_styles_list = ['koo1', 'koo1_introductory', 'facebook', 'tabular_breakdown'];
</script>

<div>
    <h5>General</h5>
    <label><input bind:checked={$my_user.autoscroll} type="checkbox" />Autoscroll</label>
    <br />
    <label><input bind:checked={$my_user.hide_help} type="checkbox" />Hide help</label>
    <br />
    <label><input bind:checked={$my_user.enable_swiping_also_on_desktop} type="checkbox" />enable_swiping_also_on_desktop
        (TODO)</label>
    <br />
    <h5>Default display style for participations</h5>
    {#each default_participations_display_styles_list as s (s)}
        <label>
            <input type="radio" bind:group={$my_user.default_participations_display_style} value={s} />
            {s}
        </label>
        <br />
    {/each}

    <h5>color theme</h5>

    <label>
        <input bind:checked={$my_user.override_browser_setting} type="checkbox" />
        override browser setting
    </label>
    <br />

    <label>
        <input bind:checked={$my_user.invert} type="checkbox" />
        invert light/dark
    </label>
    <br />
    <label>
        hue-rotate (deg):
        <input bind:value={$my_user.hue_rotate} max="9999999999" min="-9999999999" step="1" type="number" />
    </label>
    <br />
    <label>
        saturate (%):
        <input bind:value={$my_user.saturate} max="100" min="-100" step="10" type="number" />
    </label>
    <br />
    <label>
        contrast (%):
        <input bind:value={$my_user.contrast} max="100" min="-80" step="10" type="number" />
    </label>
    <br />

    {#if $debug}

        <h5>developer settings</h5>
        <label>
            <input type="checkbox" bind:checked={$my_user.crash_debug} />
            crash_debug</label
        >
        <br />
        <label>
            <input type="checkbox" bind:checked={$my_user.database_debug} />
            database_debug</label
        >
        <br />
        <label>
            <input type="checkbox" bind:checked={$my_user.auth_debug} />
            auth_debug:</label
        >
        <br />
        <label>
            <input type="checkbox" bind:checked={$my_user.graphql_debug} />
            graphql_debug:</label
        >
        <br />
    {/if}
</div>

<style>
    /*div
    {
        margin-bottom: 0px;
        margin-top: 0px;
    }*/
</style>
