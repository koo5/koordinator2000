<script context="module">
	export async function preload({ params }) {
		console.log(params);
	}
</script>

<script type='js'>
	import Campaigns from 'src/components/CampaignsSearch.svelte';

</script>

<Campaigns/>
