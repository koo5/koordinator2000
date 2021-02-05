<script context="module">
	export async function preload({ params }) {
		const data = {title:'tttt',html:"<hr><HR>"}
		return { post: data };
	}
</script>

<script>
	export let post;
</script>

<svelte:head>
	<title>{post.title}</title>
</svelte:head>

<h1>{post.title}</h1>

<div class="content">
	{@html post.html}
</div>
