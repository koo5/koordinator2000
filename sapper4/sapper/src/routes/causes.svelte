<script type='js'>

	import {subscribe, gql} from "srcs/apollo.js";
	import Campaign from 'cmps/Campaign.svelte';


	$: q = subscribe(
		gql`
		subscription {
		  causes(order_by: [{id: asc}]) {
			id,
			title,
			description,
			campaigns {
			  title
			}
		  }
		}
	  `, {});

</script>
Multiple campaigns can be grouped under one cause.
<ul>
	{#if process.browser}
		{#if $q.loading}
			<li>Loading...</li>
		{:else if $q.data}
			{#each $q.data.causes as cause (cause.id)}

				<li><h4>{cause.id} - {cause.title}</h4></li>
				<p>{cause.description}</p>

				{#each cause.campaigns as campaign (campaign.id)}
					<Campaign {campaign}/>
				{/each}

			{:else}
				<li>No causes found</li>
			{/each}
		{:else}
			<pre>{JSON.stringify($q.error, null, '  ')}</pre>
		{/if}
	{/if}
</ul>


