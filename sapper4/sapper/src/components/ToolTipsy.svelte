<script>

	import {my_user} from 'srcs/my_user.js';

	export let css_ref = '';
	export let enabled = true;

</script>

{#if enabled}

	<span class='tooltip'>
		<slot></slot>
		<div class="tooltiptext {css_ref}">
			<slot name="tooltip">tooltip</slot>
		</div>
	</span>

{:else}
	<slot></slot>

{/if}

<!--
todo
	https://dev.to/gokayokyay/how-to-use-popper-with-svelte-in-a-sveltish-way-with-actions-2h02?utm_source=dormosheio&utm_campaign=dormosheio

-->


<style>

	.tooltip {
		border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
	}

	.tooltiptext {
		visibility: hidden;
		position: absolute;
		z-index: 1;
		border: 1em 1em;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
		visibility: visible;
	}

</style>
