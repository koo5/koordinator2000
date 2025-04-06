<script lang="ts">
    import { my_user } from '$lib/client/my_user.ts';
    import { debug } from '$lib/stores.ts';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    const default_participations_display_styles_list = ['koo1', 'koo1_introductory', 'facebook', 'tabular_breakdown'];
    
    // Tab management
    const tabs = ['General', 'Display', 'Appearance', 'Developer'];
    let activeTab = 'General';
    let contentHeight = 300; // Default height
    let tabSections = {};
    
    function setActiveTab(tab: string) {
        activeTab = tab;
    }
    
    // Function to measure the tallest tab content
    function measureTabHeights() {
        // Wait for next tick to ensure DOM is updated
        setTimeout(() => {
            let maxHeight = 300;
            const sections = document.querySelectorAll('.settings-section');
            sections.forEach(section => {
                section.classList.remove('hidden');
                const height = section.scrollHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                }
                if (section.id !== `tab-${activeTab}`) {
                    section.classList.add('hidden');
                }
            });
            contentHeight = maxHeight + 20; // Add some padding
        }, 10);
    }
    
    onMount(() => {
        measureTabHeights();
    });
</script>

<div class="settings-container">
    <!-- Mobile-friendly tab navigation -->
    <div class="tab-navigation">
        {#each tabs as tab}
            {#if tab !== 'Developer' || $debug}
                <button 
                    class="tab-button {activeTab === tab ? 'active' : ''}" 
                    on:click={() => setActiveTab(tab)}>
                    {tab}
                </button>
            {/if}
        {/each}
    </div>
    
    <!-- Tab content with fixed height -->
    <div class="tab-content" style="height: {contentHeight}px">
        <!-- General Tab -->
        <div id="tab-General" class="settings-section {activeTab === 'General' ? '' : 'hidden'}" 
             in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
            <div class="form-group">
                <label class="form-check">
                    <input bind:checked={$my_user.autoscroll} type="checkbox" class="form-check-input" />
                    <span class="form-check-label">Autoscroll</span>
                </label>
            </div>
            <div class="form-group">
                <label class="form-check">
                    <input bind:checked={$my_user.hide_help} type="checkbox" class="form-check-input" />
                    <span class="form-check-label">Hide help</span>
                </label>
            </div>
            <div class="form-group">
                <label class="form-check">
                    <input bind:checked={$my_user.enable_swiping_also_on_desktop} type="checkbox" class="form-check-input" />
                    <span class="form-check-label">Enable swiping on desktop (TODO)</span>
                </label>
            </div>
        </div>
        
        <!-- Display Tab -->
        <div id="tab-Display" class="settings-section {activeTab === 'Display' ? '' : 'hidden'}" 
             in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
            <h5>Default display style for participations</h5>
            {#each default_participations_display_styles_list as style}
                <div class="form-group">
                    <label class="form-check">
                        <input type="radio" bind:group={$my_user.default_participations_display_style} value={style} class="form-check-input" />
                        <span class="form-check-label">{style}</span>
                    </label>
                </div>
            {/each}
        </div>
        
        <!-- Appearance Tab -->
        <div id="tab-Appearance" class="settings-section {activeTab === 'Appearance' ? '' : 'hidden'}" 
             in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
            <h5>Color Theme</h5>
            <div class="form-group">
                <label class="form-check">
                    <input bind:checked={$my_user.override_browser_setting} type="checkbox" class="form-check-input" />
                    <span class="form-check-label">Override browser setting</span>
                </label>
            </div>
            <div class="form-group">
                <label class="form-check">
                    <input bind:checked={$my_user.invert} type="checkbox" class="form-check-input" />
                    <span class="form-check-label">Invert light/dark</span>
                </label>
            </div>
            <div class="color-adjustments">
                <div class="form-group compact">
                    <div class="slider-row">
                        <span class="slider-label">Hue:</span>
                        <input bind:value={$my_user.hue_rotate} max="360" min="-360" step="10" type="range" class="form-range" />
                        <span class="value-display">{$my_user.hue_rotate || 0}°</span>
                    </div>
                </div>
                <div class="form-group compact">
                    <div class="slider-row">
                        <span class="slider-label">Sat:</span>
                        <input bind:value={$my_user.saturate} max="100" min="-100" step="10" type="range" class="form-range" />
                        <span class="value-display">{$my_user.saturate || 0}%</span>
                    </div>
                </div>
                <div class="form-group compact">
                    <div class="slider-row">
                        <span class="slider-label">Cont:</span>
                        <input bind:value={$my_user.contrast} max="100" min="-80" step="10" type="range" class="form-range" />
                        <span class="value-display">{$my_user.contrast || 0}%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Developer Tab -->
        {#if $debug}
            <div id="tab-Developer" class="settings-section {activeTab === 'Developer' ? '' : 'hidden'}" 
                 in:fly={{ x: 20, duration: 250, delay: 50 }} out:fly={{ x: -20, duration: 200 }}>
                <h5>Developer Settings</h5>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" bind:checked={$my_user.crash_debug} class="form-check-input" />
                        <span class="form-check-label">Crash Debug</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" bind:checked={$my_user.database_debug} class="form-check-input" />
                        <span class="form-check-label">Database Debug</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" bind:checked={$my_user.auth_debug} class="form-check-input" />
                        <span class="form-check-label">Auth Debug</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" bind:checked={$my_user.graphql_debug} class="form-check-input" />
                        <span class="form-check-label">GraphQL Debug</span>
                    </label>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .settings-container {
        display: flex;
        flex-direction: column;
    }
    
    .tab-navigation {
        display: flex;
        overflow-x: auto;
        margin-bottom: 1rem;
        border-bottom: 1px solid #dee2e6;
    }
    
    .tab-button {
        padding: 0.5rem 1rem;
        border: none;
        background: none;
        color: #6c757d;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
        position: relative;
    }
    
    .tab-button:hover {
        color: #495057;
    }
    
    .tab-button.active {
        color: #007bff;
        font-weight: 600;
    }
    
    .tab-button.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #007bff;
    }
    
    .tab-content {
        position: relative;
        transition: height 0.3s ease;
        overflow: hidden;
    }
    
    .settings-section {
        padding: 0.5rem 0;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 1;
        transition: opacity 0.3s;
        overflow-y: auto;
    }
    
    .settings-section.hidden {
        opacity: 0;
        pointer-events: none;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-check {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        cursor: pointer;
    }
    
    .form-check-input {
        margin-right: 0.5rem;
    }
    
    .form-label {
        display: block;
        margin-bottom: 0.5rem;
    }
    
    .form-range {
        width: 100%;
        padding: 0;
        margin: 0.5rem 0;
    }
    
    .value-display {
        display: inline-block;
        margin-left: 0.5rem;
        min-width: 2.5rem;
        text-align: right;
    }
    
    .color-adjustments {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 0.75rem;
        margin-top: 0.5rem;
    }
    
    .form-group.compact {
        margin-bottom: 0.5rem;
    }
    
    .slider-row {
        display: flex;
        align-items: center;
    }
    
    .slider-label {
        width: 3rem;
        font-size: 0.875rem;
        color: #495057;
    }
    
    h5 {
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
</style>
