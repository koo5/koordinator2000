<script>
	import Campaigns from "cmps/Campaigns.svelte";
</script>

<style>

	p {
		margin: 1em auto;
	}

</style>

<svelte:head>
	<title>Koordinator</title>
</svelte:head>




<h1>Welcome to Koordinator.</h1>
<p>
	Work in progress. <a href="https://github.com/koo5/koordinator2000/blob/master/README.md">README</a>. It's like kickstarter, but not for collecting money, it's for doing things.</p>
<p>You can click around, view campaigns, play with participations, see notifications, swipe left and right.. The basic logic is implemented, but mostly it is still just a demo with fake buttons and no authentication.</p>

<h1>Featured Campaigns:</h1>

<Campaigns/>


