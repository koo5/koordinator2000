<script lang='ts'>
  import {my_user, default_participations_display_style} from '../my_user.js';
  import { theme, user, addNotification } from '$lib/stores';
  
  // Default styles list
  const default_participations_display_styles_list = ['koo1', 'koo1_introductory', 'facebook', 'tabular_breakdown'];
  
  // Local state for additional settings
  let darkMode = $theme.dark;
  
  // Handle theme toggle
  function toggleDarkMode() {
    darkMode = !darkMode;
    theme.update(t => ({ ...t, dark: darkMode }));
  }
  
  // Save all settings
  function saveSettings() {
    addNotification('Settings saved successfully', 'success');
  }
</script>

<div class="settings-container">
  <div class="settings-section">
    <h3>General</h3>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.autoscroll}>Autoscroll</label>
    </div>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.hide_help}>Hide help</label>
    </div>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.enable_swiping_also_on_desktop}>Enable swiping on desktop</label>
    </div>
  </div>
  
  <div class="settings-section">
    <h3>Display Style for Participations</h3>
    {#each default_participations_display_styles_list as style (style)}
      <div class="setting-item radio-item">
        <label>
          <input type="radio" bind:group={$my_user.default_participations_display_style} value={style}>
          {style}
        </label>
      </div>
    {/each}
  </div>
  
  <div class="settings-section">
    <h3>Color Theme</h3>
    <div class="setting-item">
      <label for="dark-mode">Dark Mode</label>
      <div class="toggle">
        <input 
          type="checkbox" 
          id="dark-mode" 
          bind:checked={darkMode} 
          on:change={toggleDarkMode}
        />
        <span class="slider"></span>
      </div>
    </div>
    
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.override_browser_setting}/> Override browser setting</label>
    </div>
    
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.invert}/> Invert light/dark</label>
    </div>
    
    <div class="setting-item with-input">
      <label>Hue-rotate (deg):</label>
      <input type="number" step="1" min="-360" max="360" bind:value={$my_user.hue_rotate}/>
    </div>
    
    <div class="setting-item with-input">
      <label>Saturate (%):</label>
      <input type="range" min="-100" max="100" step="10" bind:value={$my_user.saturate}/>
      <span class="value">{$my_user.saturate}</span>
    </div>
    
    <div class="setting-item with-input">
      <label>Contrast (%):</label>
      <input type="number" min="-80" max="100" step="10" bind:value={$my_user.contrast}/>
    </div>
  </div>
  
  <div class="settings-section">
    <h3>Developer Settings</h3>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.crash_debug}> Crash debug</label>
    </div>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.database_debug}> Database debug</label>
    </div>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.auth_debug}> Auth debug</label>
    </div>
    <div class="setting-item">
      <label><input type="checkbox" bind:checked={$my_user.graphql_debug}> GraphQL debug</label>
    </div>
  </div>
  
  <button class="save-button" on:click={saveSettings}>Save Settings</button>
</div>

<style>
  .settings-container {
    padding: 1rem;
  }
  
  .settings-section {
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #555;
    font-size: 1.2rem;
    background: transparent;
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .setting-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .setting-item.with-input {
    justify-content: space-between;
  }
  
  .radio-item {
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  label {
    font-weight: 500;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    margin-left: auto;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #ff3e00;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
  
  input[type="range"] {
    width: 150px;
    margin: 0 10px;
  }
  
  .value {
    min-width: 30px;
    text-align: center;
  }
  
  .save-button {
    background-color: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 1rem;
    width: 100%;
  }
  
  .save-button:hover {
    background-color: #e63600;
  }
</style>