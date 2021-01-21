<script>

	import { my_user } from 'srcs/my_user.js';
	export let css_ref;

</script>

	{#if $my_user.database_debug}
		<span class='tooltip' {css_ref}>
			<div class="tooltiptext dev">
				<slot name="tooltip"></slot>
			</div>
			<slot></slot>
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
		padding: 1em 1em;
	}

	.dev {
		border-style: dotted;
		background-color: rgb(230,230,230);
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
		visibility: visible;
	}

</style>
