<script>
  import { onMount } from 'svelte';
  import { page, navigating } from '$app/stores';
  import { theme, user } from '$lib/stores';
  import { browser } from '$app/environment';
  import { Col, Container, Row } from 'sveltestrap';
  import SettingsModal from '../components/SettingsModal.svelte';
  import TheNagModal from '../components/TheNagModal.svelte';
  import Nav from '../components/Nav.svelte';
  // Notification system is handled by lib/stores.js
  import { setClient } from '$lib/apollo-compat-wrapper.svelte';
  import { new_apollo_client } from '$lib/apollo.js';
  import {
    Auth0Context,
    idToken,
    userInfo,
  } from '@dopry/svelte-auth0';
  import { my_user, ensure_we_exist, apply_newly_authenticated_user, event } from '../my_user.js';
  import { set_css_var, saturate_computate } from '../stuff.js';
  import { initVersionCheck } from '$lib/version-check';
  
  // Import Node.js compatibility polyfills
  import '../polyfills.js';
  
  export let data;
  
  // Set up Auth0 configuration
  let audience = undefined;
  let domain = "dev-koord11.eu.auth0.com";
  let client_id = "GjHr32K9lxNsmzoBBdoFE44IDXg24btf";
  
  $: PUBLIC_URL = data.session?.PUBLIC_URL;
  $: callback_url = PUBLIC_URL + "/you";
  $: logout_url = PUBLIC_URL + "/you";
  
  // Set up Apollo client
  if (browser) {
    setClient(new_apollo_client());
  }
  
  // Auth0 token handling
  $: maybe_ping_server_about_this($idToken, $userInfo);
  
  async function maybe_ping_server_about_this(token, info) {
    if (!browser) return;
    
    let auth = {'auth0': {token, info}};
    my_user.update((u) => {
      return {...u, auth};
    });
    
    let event_result = await event($my_user);
    if (event_result && event_result.user) {
      console.log('ich bin logged in');
      my_user.set(event_result.user);
    }
  }
  
  // Theme setting variables
  $: color_theme_hue_rotate = $my_user.hue_rotate;
  $: color_theme_saturate = $my_user.saturate;
  $: color_theme_invert = $my_user.invert;
  $: color_theme_contrast = $my_user.contrast;
  
  // Set CSS variables for theming
  $: set_css_var('--hue_rotate', ((color_theme_invert ? 180 : 0) + (color_theme_hue_rotate || 0)) + "deg");
  $: set_css_var('--saturate', saturate_computate(color_theme_saturate));
  $: set_css_var('--invert', (color_theme_invert ? 100 : 0) + "%");
  $: set_css_var('--contrast', (100 + (color_theme_contrast || 0)) + "%");
  
  // Settings modal toggle function
  let toggle_settings = () => {
    // This is a placeholder that will be bound by the SettingsModal component
    console.log('Settings toggle called but not bound yet');
  };
  
  // Handle any client-side initialization
  onMount(async () => {
    // Note: private keys are only available server-side
    // Client-side should only handle public operations
    
    // Set user from server data if available
    if (data.user) {
      user.set(data.user);
    }
    
    // Check if we need to create a user
    try {
      let u = await ensure_we_exist();
      if (u) {
        await apply_newly_authenticated_user(u);
      }
    } catch (e) {
      console.error('Error during user initialization:', e);
    }
    
    // Verify SvelteKit versions
    initVersionCheck();
    
    console.log('SvelteKit app mounted');
  });
</script>

<svelte:head>
  <!-- Bootstrap theme -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/materia/bootstrap.min.css" 
    integrity="sha384-B4morbeopVCSpzeC1c4nyV0d0cqvlSAfyXVfrPJa25im5p+yEN/YmhlgQP/OyMZD" crossorigin="anonymous">
  
  <!-- Note: CodeMirror script is loaded in app.html -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/firepad@1.5.9/dist/firepad.css" />
  
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<!-- Show loading indicator when navigating between pages -->
{#if $navigating}
  <div class="loading-indicator">
    <div class="spinner"></div>
  </div>
{/if}

{#if browser && $my_user}
  <Auth0Context
    {domain}
    {client_id}
    {audience}
    {callback_url}
    {logout_url}>
    
    <SettingsModal bind:toggle_settings={toggle_settings}/>
    <TheNagModal/>
    
    <Container>
      <Row>
        <Col>
          <Nav {data} {toggle_settings} />
        </Col>
      </Row>
      <Row>
        <Col xs="auto">
          <main>
            <slot></slot>
          </main>
        </Col>
      </Row>
    </Container>
    
    {#if $my_user.auth_debug}
      <div class="content_block">
        auth0 configuration:
        <pre>
          audience = {audience}
          domain = {domain}
          client_id = {client_id}
          
          PUBLIC_URL = {PUBLIC_URL}
          callback_url = {callback_url}
          logout_url = {logout_url}
        </pre>
      </div>
    {/if}
  </Auth0Context>
{:else}
  <div class="content_block">
    Koordinator is like kickstarter, but it's not for collecting money, it's for collective action. 
    See the <a href="https://github.com/koo5/koordinator2000/">code.</a><br>
    <p>
    <div class="animate-flicker">Loading...</div>
  </div>
{/if}

<style>
  :root {
    --primary-color: #ff3e00;
    --background-color: white;
    --text-color: #333;
  }
  
  /* Removed unused .app selector */

  main {
    position: relative;
    background-color: #ffeeee;
    margin: 0 auto;
    box-sizing: border-box;
    flex: 1;
  }

  /* Removed unused footer selector */

  /* Removed unused .dark-mode selector */

  .loading-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #ff3e00;
    z-index: 1000;
  }

  .spinner {
    height: 100%;
    width: 100%;
    background: linear-gradient(to right, transparent, #ff3e00, transparent);
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  :global(#sapper) {
    background-color: #ffeeee;
  }

  :global(html) {
    margin: 0 auto;
    background-color: #ffeeee;
    filter: hue-rotate(var(--hue_rotate)) contrast(var(--contrast)) invert(var(--invert)) saturate(var(--saturate));
    height: 100%;
  }

  :global(.navbar) {
    background: #ffffee !important;
    margin-bottom: 1em;
  }

  :global(.content_block) {
    margin: 0 auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    max-width: 60rem;
    padding: 3vh 3vw;
    background: #ffffee;
    box-shadow: 0 1px 4px rgb(0 0 0 / 40%);
  }

  :global(h1, h2, h3, h4, h5) {
    background: #dddddd;
    margin: 1em;
    margin-top: 1em;
    margin-bottom: 1em;
    padding-top: 0;
    padding-bottom: 0;
  }

  @keyframes flickerAnimation {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  @-o-keyframes flickerAnimation {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  @-moz-keyframes flickerAnimation {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  @-webkit-keyframes flickerAnimation {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  :global(.animate-flicker) {
    -webkit-animation: flickerAnimation 1s infinite;
    -moz-animation: flickerAnimation 1s infinite;
    -o-animation: flickerAnimation 1s infinite;
    animation: flickerAnimation 1s infinite;
  }

  :global(.dev) {
    border-style: dotted;
    background-color: rgb(230, 230, 230);
  }
</style>
