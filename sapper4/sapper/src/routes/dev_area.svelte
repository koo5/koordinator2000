<script>
	import TestModal from 'cmps/TestModal.svelte';
	let segment = 0;
</script>
<div class="content_block">

	<ul>
		<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">about</a></li>
		<li><a rel=prefetch aria-current="{segment === 'blog' ? 'page' : undefined}" href="blog">blog</a></li>
		<li><a rel=prefetch aria-current="{segment === 'causes' ? 'page' : undefined}" href="causes">Causes</a></li>
		<li><a rel=prefetch aria-current="{segment === 'add_cause' ? 'page' : undefined}" href="add_cause">Add Cause</a>
		</li>
		<li><a rel=prefetch aria-current="{segment === 'users' ? 'page' : undefined}" href="users">users</a></li>
	</ul>
	<img src="less_sat_by_telepatx_d2n736h-fullview.jpg" alt="alt"/>

	<TestModal/>

</div>

<style>

    ul {
        margin: 0;
        padding: 0;
    }

    ul::after {
        content: '';
        display: block;
        clear: both;
    }

    li {
        display: block;
        float: left;
    }

    a {
        text-decoration: none;
        padding: 1em 0.5em;
        display: block;
    }


</style>
