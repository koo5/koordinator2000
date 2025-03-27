<script>
  import { user } from '$lib/stores';
</script>

<svelte:head>
  <title>About | Koordinator</title>
</svelte:head>

<div class="about-container">
  <h1>About Koordinator</h1>
  
  <div class="content">
    <p>
      Koordinator is a platform for coordinating campaigns and actions. It helps people organize
      and participate in various initiatives.
    </p>

    <h2>Where am I?</h2>
    <div class="content_block">
      <p>This is a preview of Koordinator. It's like kickstarter, but not for collecting money, it's for doing things.</p>
      <p>On Kickstarter, people support campaigns by pledging money. If enough money is pledged, the campaign author can
        collect them. Here, you pledge your participation in campaigns, and you choose how many people is enough. For
        example, you would not boycott a supermarket chain all alone. Here you can create a campaign and suggest a
        threshold number. Maybe 50000 people? That should make a dent in their profits, if everyone starts at once and
        keeps at it...</p>
    </div>
    <h2>It looks broken..</h2>
    <div class="content_block">
      <p>Koordinator is a <a href="https://github.com/koo5/koordinator2000/">work in progress</a>. You can click around,
        view campaigns,
        participate, see and confirm notifications, you can swipe left to dismimss and right to participate.. The basic
        logic is implemented, but mostly it is still just a demo with some fake buttons and no authentication.
        Come talk to us on <a href="https://webchat.freenode.net/#koordinator">IRC</a> and <a
                href="https://discord.gg/QP9mhdEk">discord</a>.
      </p>
    </div>



    {#if $user}
      <div class="user-info">
        <p>You are currently logged in as <strong>{$user.name}</strong>.</p>
      </div>
    {:else}
      <div class="login-prompt">
        <p>You are not logged in. <a href="/login">Login</a> to access all features.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .about-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .user-info, .login-prompt {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .user-info {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
  }
  
  .login-prompt {
    background-color: #fff8e1;
    border-left: 4px solid #ffc107;
  }
  
  a {
    color: #ff3e00;
    text-decoration: none;
    font-weight: bold;
  }
  
  a:hover {
    text-decoration: underline;
  }
</style>
