<script lang="js">
	let md;
	let value = 'Hello, **world**!';

	const initializeRemarkable = () => {
		md = new window.remarkable.Remarkable();
	}
</script>

<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/remarkable/2.0.0/remarkable.min.js" on:load={initializeRemarkable}></script>
</svelte:head>


<div>
  <label htmlFor="markdown-content">
    Enter some markdown:<br>
  <textarea
    id="markdown-content"
    bind:value={value}
  />
  </label>
  <h3>Rendering:</h3>
  <div
    className="content">
		{#if md}
	    {@html md.render(value)}
		{/if}
  </div>
</div>
