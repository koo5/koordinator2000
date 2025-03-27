<script>
  export let data;
  const { posts } = data;
</script>

<style>
  ul {
    margin: 0 0 1em 0;
    line-height: 1.5;
  }
</style>

<svelte:head>
  <title>Blog</title>
</svelte:head>

<h1>Blog</h1>

<ul>
  {#each posts as post}
    <!-- Use SvelteKit's data-sveltekit-preload-data instead of rel=prefetch -->
    <li><a data-sveltekit-preload-data href="/blog/{post.slug}">{post.title}</a></li>
  {/each}
</ul>