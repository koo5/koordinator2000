<script lang="ts">
  import { theme, user, addNotification } from '$lib/stores';
  
  // Define types
  interface ThemeSettings {
    dark: boolean;
    saturate: number;
    [key: string]: any;
  }
  
  interface UserSettings {
    autoscroll?: boolean;
    [key: string]: any;
  }
  
  // Local state for settings
  let darkMode = $theme.dark;
  let saturation = $theme.saturate;
  let autoScroll = $user?.autoscroll ?? true;
  
  // Handle theme toggle
  function toggleDarkMode(): void {
    darkMode = !darkMode;
    theme.update((t: ThemeSettings) => ({ ...t, dark: darkMode }));
  }
  
  // Handle saturation change
  function updateSaturation(event: Event): void {
    const target = event.target as HTMLInputElement;
    saturation = parseInt(target.value);
    theme.update((t: ThemeSettings) => ({ ...t, saturate: saturation }));
  }
  
  // Handle auto-scroll toggle
  function toggleAutoScroll(): void {
    autoScroll = !autoScroll;
    if ($user) {
      // Update user preferences
      user.update((u: UserSettings) => ({ ...u, autoscroll: autoScroll }));
      
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.autoscroll = autoScroll;
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (e) {
          console.error('Error updating user settings in localStorage', e);
        }
      }
    }
  }
  
  // Save all settings
  function saveSettings(): void {
    addNotification('Settings saved successfully', 'success');
  }
</script>

<div class="settings-container">
  <h2>Settings</h2>
  
  <div class="settings-section">
    <h3>Appearance</h3>
    
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
      <label for="saturation">Color Saturation</label>
      <input 
        type="range" 
        id="saturation" 
        min="-50" 
        max="50" 
        bind:value={saturation} 
        on:input={updateSaturation}
      />
      <span class="value">{saturation}</span>
    </div>
  </div>
  
  <div class="settings-section">
    <h3>Behavior</h3>
    
    <div class="setting-item">
      <label for="auto-scroll">Auto-scroll to new content</label>
      <div class="toggle">
        <input 
          type="checkbox" 
          id="auto-scroll" 
          bind:checked={autoScroll} 
          on:change={toggleAutoScroll}
        />
        <span class="slider"></span>
      </div>
    </div>
  </div>
  
  <button class="save-button" on:click={saveSettings}>Save Settings</button>
</div>

<style>
  .settings-container {
    padding: 1rem;
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
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
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .setting-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  label {
    font-weight: 500;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
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
    width: 200px;
    margin-right: 10px;
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
