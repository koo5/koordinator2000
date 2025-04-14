<script lang="ts">
    import { my_user } from '$lib/client/my_user.ts';
    import { debug } from '$lib/stores.ts';
    import { fly } from 'svelte/transition';

    const default_participations_display_styles_list = ['koo1', 'koo1_introductory', 'facebook', 'tabular_breakdown'];

    // Tab management
    const tabs = ['General', 'Display', 'Appearance', 'Developer'];
    let activeTab = 'General';

    function setActiveTab(tab: string) {
        activeTab = tab;
    }
</script>

<div class="flex flex-col">
    <!-- Tab navigation -->
    <div role="tablist" class="tabs tabs-bordered">
        {#each tabs as tab}
            {#if tab !== 'Developer' || $debug}
                <a role="tab" 
                   class="tab {activeTab === tab ? 'tab-active' : ''}"
                   on:click|preventDefault={() => setActiveTab(tab)}>
                    {tab}
                </a>
            {/if}
        {/each}
    </div>

    <!-- Tab content -->
    <div class="mt-4">
        <!-- General Tab -->
        <div class="{activeTab === 'General' ? 'block' : 'hidden'}"
             in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
            <div class="form-control mb-3">
                <label class="cursor-pointer label justify-start gap-3">
                    <input bind:checked={$my_user.settings.autoscroll} type="checkbox" class="checkbox checkbox-sm" />
                    <span class="label-text">Autoscroll</span>
                </label>
            </div>
            <div class="form-control mb-3">
                <label class="cursor-pointer label justify-start gap-3">
                    <input bind:checked={$my_user.hide_help} type="checkbox" class="checkbox checkbox-sm" />
                    <span class="label-text">Hide help</span>
                </label>
            </div>
            <div class="form-control mb-3">
                <label class="cursor-pointer label justify-start gap-3">
                    <input bind:checked={$my_user.enable_swiping_also_on_desktop} type="checkbox" class="checkbox checkbox-sm" />
                    <span class="label-text">Enable swiping on desktop (TODO)</span>
                </label>
            </div>
        </div>

        <!-- Display Tab -->
        <div class="{activeTab === 'Display' ? 'block' : 'hidden'}"
             in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
            <h3 class="font-medium text-lg mb-3">Default display style for participations</h3>
            <div class="flex flex-col gap-2">
                {#each default_participations_display_styles_list as style}
                    <div class="form-control">
                        <label class="cursor-pointer label justify-start gap-3">
                            <input type="radio" bind:group={$my_user.default_participations_display_style} 
                                  value={style} class="radio radio-sm" />
                            <span class="label-text">{style}</span>
                        </label>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Appearance Tab -->
        <div class="{activeTab === 'Appearance' ? 'block' : 'hidden'}"
             in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
            <h3 class="font-medium text-lg mb-3">Color Theme</h3>
            <div class="form-control mb-3">
                <label class="cursor-pointer label justify-start gap-3">
                    <input bind:checked={$my_user.override_browser_setting} type="checkbox" class="checkbox checkbox-sm" />
                    <span class="label-text">Override browser setting</span>
                </label>
            </div>
            <div class="form-control mb-3">
                <label class="cursor-pointer label justify-start gap-3">
                    <input bind:checked={$my_user.invert} type="checkbox" class="checkbox checkbox-sm" />
                    <span class="label-text">Invert light/dark</span>
                </label>
            </div>
            <div class="bg-base-200 p-3 rounded-lg mt-2">
                <div class="form-control mb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-12 text-sm">Hue:</span>
                        <input bind:value={$my_user.hue_rotate} max="360" min="-360" step="10" type="range" class="range range-xs" />
                        <span class="w-10 text-right text-sm">{$my_user.hue_rotate || 0}°</span>
                    </div>
                </div>
                <div class="form-control mb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-12 text-sm">Sat:</span>
                        <input bind:value={$my_user.saturate} max="100" min="-100" step="10" type="range" class="range range-xs" />
                        <span class="w-10 text-right text-sm">{$my_user.saturate || 0}%</span>
                    </div>
                </div>
                <div class="form-control">
                    <div class="flex items-center gap-2">
                        <span class="w-12 text-sm">Cont:</span>
                        <input bind:value={$my_user.contrast} max="100" min="-80" step="10" type="range" class="range range-xs" />
                        <span class="w-10 text-right text-sm">{$my_user.contrast || 0}%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Developer Tab -->
        {#if $debug}
            <div class="{activeTab === 'Developer' ? 'block' : 'hidden'}"
                 in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
                <h3 class="font-medium text-lg mb-3">Developer Settings</h3>
                <div class="form-control mb-2">
                    <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" bind:checked={$my_user.crash_debug} class="checkbox checkbox-sm" />
                        <span class="label-text">Crash Debug</span>
                    </label>
                </div>
                <div class="form-control mb-2">
                    <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" bind:checked={$my_user.database_debug} class="checkbox checkbox-sm" />
                        <span class="label-text">Database Debug</span>
                    </label>
                </div>
                <div class="form-control mb-2">
                    <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" bind:checked={$my_user.auth_debug} class="checkbox checkbox-sm" />
                        <span class="label-text">Auth Debug</span>
                    </label>
                </div>
                <div class="form-control mb-2">
                    <label class="cursor-pointer label justify-start gap-3">
                        <input type="checkbox" bind:checked={$my_user.graphql_debug} class="checkbox checkbox-sm" />
                        <span class="label-text">GraphQL Debug</span>
                    </label>
                </div>
            </div>
        {/if}
    </div>
</div>
