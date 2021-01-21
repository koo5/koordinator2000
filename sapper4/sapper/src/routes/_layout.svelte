<script>
	import Nav from 'cmps/Nav.svelte';
	import {my_user} from 'srcs/my_user.js';
	import {onMount} from 'svelte';
	import {setClient} from 'svelte-apollo';
	import {new_apollo_client} from 'srcs/apollo.js';


	export let segment;

	if (process.browser)
	{
		setClient(new_apollo_client());
	}

</script>

<style>
/*	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}*/
</style>



<Nav {segment}/>

<main>
	<slot></slot>
</main>



<svelte:head>

	<!-- <script src="https://www.gstatic.com/firebasejs/5.5.4/firebase.js"></script> -->
	<!-- or -->
	<!--
		<script src="https://www.gstatic.com/firebasejs/5.5.4/firebase-app.js"></script>
		<script src="https://www.gstatic.com/firebasejs/5.5.4/firebase-database.js"></script>
	-->

	<!-- CodeMirror -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.17.0/codemirror.js"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.17.0/codemirror.css"/>

	<!-- Firepad -->
	<link rel="stylesheet" href="https://firepad.io/releases/v1.5.9/firepad.css"/>
	<script src="https://firepad.io/releases/v1.5.9/firepad.js"></script>
	<!--
	<script src="https://firepad.io/releases/v1.5.10/firepad.min.js"></script>
	-->

</svelte:head>
