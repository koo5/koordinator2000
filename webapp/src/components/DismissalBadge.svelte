<script lang='js'>
  // Svelte 4 style
  export let dismissal;
</script>

<span class="dismissal">
  👎<a href="/users/{dismissal.account.id}">{dismissal.account.name}</a>
</span>

<style>
  .dismissal {
    background-color: rgb(210,210,255);
    border-radius: 4px;
    padding: 2px 4px;
    margin: 0 2px;
  }
</style>