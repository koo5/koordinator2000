<script lang="ts">
	import { gql, queryStore, getContextClient } from '$lib/urql.ts';
	import {my_user} from '../my_user.ts';
	import CampaignList from './CampaignList.svelte';
	import * as animateScroll from 'svelte-scrollto';
	import { browser } from '$app/environment';
	import { debug } from '$lib/stores';
	import {onMount, tick} from "svelte";

	const client = getContextClient();

	interface CampaignListResult {
		campaigns: Array<{
			id: number;
		}>;
	}

	interface QueryVariables {
		_user_id: number;
		_seen_ids: number[];
	}

	const CAMPAIGN_LIST = gql`
		query CampaignList($_user_id: Int, $_seen_ids: [Int!]) {
			campaigns(
				order_by: [{id: asc}],
				limit: 5,
				where: {
					_and:
					{
						smazano: {_eq: false},
						stealth: {_eq: false},
						_not: {campaign_dismissals: {account_id: {_eq: $_user_id}}},
						id: {_nin: $_seen_ids}
					}
				}
			)
			{
				id
			}
		}
  	`;

	$: my_user_id = $my_user.id;
	let items;
	let seen: number[] = [];
	$: seeing = get_seeing($items?.data?.campaigns);

	function get_seeing(campaigns: Array<{id: number}> | undefined): number[] {
		const result: number[] = [];
		campaigns?.forEach((x) => {
			result.push(x.id);
		});
		return result;
	}

	async function more(): void {
		if (browser) {
			if (items_div) {
				animateScroll.scrollTo({delay: 0, element: items_div});
			}
			more_button?.blur();
		}
		seen = seen.concat(seeing);
		await tick();
		search();
	}

	let vars: QueryVariables = {
		_user_id: my_user_id,
		_seen_ids: seen,
	};
	
	$: vars = {
		_user_id: my_user_id,
		_seen_ids: seen,
	};

	function search() {
		items = queryStore<CampaignListResult>({
			client,
			query: CAMPAIGN_LIST,
			variables: vars
		});
	}

	onMount(() => {
				search();
			}
	);

	let more_button: HTMLButtonElement | null = null;
	let items_div: HTMLDivElement | null = null;

</script>
<div class="content_block">
	* search - searches titles and descriptions

	* categories:
	[all] [ecology] [human rights] [animal rights] [commerce & products] [tech] [politics]
	<br>
	* items on page:
	[5] [15] [50]
	<br>
	* sort:
	[title]
	[proximity]
	[number of participants] - default
	[date created]
	[last activity]
	* view:
	[details] [list] [map]
	* live updates [on] [off]

	{#if $debug}

	<br>
	seen:{JSON.stringify(seen, null, '')}:
	<br>
	seeing:{JSON.stringify(seeing, null, '')}:
	<br>
	{/if}

</div>

<div bind:this={items_div}>

	seeing={JSON.stringify(seeing, null, '')}:

	<CampaignList ids={seeing}/>

</div>

<center>
	<button class="btn btn-primary" bind:this={more_button} color="secondary" aria-label="more..." on:click={more}>
		more...
	</button>

</center>
<br/>
<br/>

