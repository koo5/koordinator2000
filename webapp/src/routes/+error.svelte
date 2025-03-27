<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status}</title>
</svelte:head>

<div class="error">
  <h1>{$page.status}</h1>
  <p>{$page.error.message}</p>
  {#if $page.error.stack}
    <pre>{$page.error.stack}</pre>
  {/if}
  <a href="/">Go to home page</a>
</div>

<style>
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  h1 {
    font-size: 2.8em;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  p {
    margin: 1em auto;
  }

  a {
    color: #ff3e00;
    text-decoration: none;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }

  pre {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 1em;
    overflow-x: auto;
    width: 100%;
    max-width: 60em;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>
