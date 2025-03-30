<script lang="ts">
	import Campaign from './Campaign.svelte';
	import {my_user, type Campaign as CampaignType} from '../my_user';
	import * as animateScroll from "svelte-scrollto";
	import {gql, subscriptionStore, getContextClient} from "$lib/urql";
	import SubscribedItemsInner from './SubscribedItemsInner.svelte';
	import {CAMPAIGN_FRAGMENT} from '../stuff';
	import { browser } from '$app/environment';
	import type { OperationResultState } from '@urql/core';
	import { onMount } from 'svelte';
	
	// Import Swiper Element components
	// These are registered globally as custom elements
	import { register } from 'swiper/element/bundle';

	// No default export needed for Svelte components
	
	// Interface definitions
	interface CampaignQueryResult {
		campaigns: CampaignType[];
	}
	
	interface CampaignQueryStore extends OperationResultState<CampaignQueryResult> {
		data?: CampaignQueryResult;
	}
	
	export let ids: number[];
	
	// Register Swiper elements when the component mounts
	onMount(() => {
		if (browser) {
			register();
		}
	});
	
	// Query with ids filter
	const CAMPAIGN_LIST = gql`
		subscription ($_user_id: Int, $_ids: [Int!]) {
			campaigns(
				where: {
					id: {_in: $_ids}
				}
			)
			${CAMPAIGN_FRAGMENT}
		}
	`;
	
	$: campaigns_query = subscriptionStore({
		client: getContextClient(),
		query: CAMPAIGN_LIST,
		variables: {
			_user_id: my_user_id,
			_ids: ids
		}
	});
	
	// This will be set from the slot:da in SubscribedItemsInner
	let campaignsData: CampaignQueryResult | undefined;
	
	// Sort campaigns function to maintain the order specified by the ids array
	function sort_campaigns(ids: number[], data?: CampaignQueryResult): CampaignType[] {
		if (!data) return [];
		
		const campaigns = data.campaigns;
		const by_ids: Record<number, CampaignType> = {};
		
		campaigns.forEach((c: CampaignType) => {
			by_ids[c.id] = c;
		});
		
		const result: CampaignType[] = [];
		
		ids.forEach((id: number) => {
			if (by_ids[id]) {
				result.push(by_ids[id]);
			}
		});
		
		return result;
	}
	
	// Derived store for sorted campaigns, using the campaignsData passed from slot
	$: campaigns = sort_campaigns(ids, campaignsData);
	
	let my_timeout: ReturnType<typeof setTimeout> | undefined;
	let campaign_containers: HTMLDivElement | null = null;
	$: my_user_id = $my_user.id;
	
	// Reference to store swiper instances
	const swiperInstances: Record<number, any> = {};
	
	// Swiper parameters
	const swiperParams = {
		initialSlide: 2, // Start at the center slide (index 2)
		centeredSlides: true,
		spaceBetween: 10,
		grabCursor: true,
		pagination: {
			clickable: true,
			renderBullet: (index: number, className: string) => {
				const names = ['Dismiss All', 'Dismiss', 'View', 'Participate', 'Participate All'];
				return `<span class="${className}">${names[index]}</span>`;
			}
		},
		cssMode: true,
		keyboard: true
	};
	
	function handleSlideChange(campaignId: number, swiper: any) {
		if (!$my_user.autoscroll) return;
		
		const activeIndex = swiper.activeIndex;
		
		// Only run auto-scroll if user moved away from the center slide
		if (activeIndex !== 2) {
			// Wait a bit for animations to complete, then scroll to next campaign
			my_timeout = setTimeout(() => {
				go_to_next_campaign(campaignId);
			}, 1000);
		}
	}
	
	function go_to_next_campaign(current_campaign_id: number): void {
		if (!$my_user.autoscroll) return;
		
		// Make sure campaign container exists
		if (!campaign_containers) return;
		const containerElement = campaign_containers as unknown as HTMLElement;
		if (!containerElement.children) return;
		
		const children = containerElement.children;
		for (let i = 0; i < children.length; i++) {
			const ch = children[i] as HTMLElement;
			if (!ch.dataset) return;
			
			const j = ch.dataset.campaignId;
			if (current_campaign_id.toString() === j) {
				const next_ch = children[i+1] as HTMLElement;
				if (!next_ch) return;
				
				// Scroll to next campaign
				animateScroll.scrollTo({delay: 0, element: next_ch});
				return;
			}
		}
	}
	
	// We don't need this interface anymore as we're using 'any' type

	// Initialize the Swiper instances after the DOM is updated
	function swiperInitialized(event: any, campaignId: number) {
		console.log('Swiper initialized for campaign:', campaignId);
		// Store reference to swiper instance
		swiperInstances[campaignId] = event.detail[0];
		
		// Add slide change event handler
		swiperInstances[campaignId].on('slideChange', () => {
			handleSlideChange(campaignId, swiperInstances[campaignId]);
		});
	}
</script>

<!-- Import Swiper styles -->
<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
</svelte:head>

<div bind:this="{campaign_containers}">
	<SubscribedItemsInner items={campaigns_query} let:da={itemsData}>

		{#each itemsData.campaigns as campaign (campaign.id)}
			{#if browser}

				campaign id={campaign.id}

			<div class="campaign-wrapper" data-campaign-id={campaign.id}>
				<!-- Swiper Element Component -->
				<swiper-container
					class="campaign-swiper"
					data-campaign-id={campaign.id}
					initial-slide="2"
					centered-slides="true"
					space-between="10"
					slides-per-view="1"
					css-mode="true"
					grab-cursor="true"
					keyboard="true"
					on:swiperinitialized={(e) => swiperInitialized(e, campaign.id)}
				>
					<!-- Slide 0: Far Left - Dismiss All -->
					<swiper-slide class="campaign-slide dismiss-all">
						<div class="action-panel">
							<h3>Dismiss All</h3>
							<p>Dismiss all campaigns of this cause/user</p>
							<button class="btn-action btn-dismiss-all">Dismiss all campaigns of this cause</button>
							<button class="btn-action btn-dismiss-user">Dismiss all campaigns of this user</button>
						</div>
					</swiper-slide>
					
					<!-- Slide 1: Left - Dismiss -->
					<swiper-slide class="campaign-slide dismiss">
						<div class="action-panel">
							<h3>Dismiss</h3>
							<p>I don't care about this cause</p>
							<button class="btn-action btn-dismiss">Dismiss this campaign</button>
						</div>
					</swiper-slide>
					
					<!-- Slide 2: Center (Main) - Campaign View -->
					<swiper-slide class="campaign-slide main">
						<div class="campaign-content">
							<Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)}/>
						</div>
					</swiper-slide>
					
					<!-- Slide 3: Right - Participate -->
					<swiper-slide class="campaign-slide participate">
						<div class="action-panel">
							<h3>Participate</h3>
							<p>Mark as participating in this campaign</p>
							<button class="btn-action btn-participate">Participate in this campaign</button>
						</div>
					</swiper-slide>
					
					<!-- Slide 4: Far Right - Participate All -->
					<swiper-slide class="campaign-slide participate-all">
						<div class="action-panel">
							<h3>Participate All</h3>
							<p>Participate in all related campaigns</p>
							<button class="btn-action btn-participate-all">Participate in all campaigns of this cause</button>
							<button class="btn-action btn-participate-user">Participate in all campaigns of this user</button>
						</div>
					</swiper-slide>
				</swiper-container>
			</div>
			{:else}
			<!-- SSR fallback to show campaigns without swiper -->
			<div class="campaign-fallback">
				<Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)}/>
			</div>
			{/if}
		{:else}
			<div class="no-campaigns">No campaigns found</div>
		{/each}
	</SubscribedItemsInner>
</div>

<style>
	:global(.info_tooltip) {
		padding: 1em;
	}
	
	:global(.confirmed) {
		background-color: #aaffaa;
	}
	
	:global(.condition_is_fulfilled) {
		background-color: #ccffcc;
	}
	
	:global(.condition_is_not_fulfilled) {
		background-color: #ffffcc;
	}
	
	.campaign-wrapper {
		margin: 2rem 0;
		position: relative;
	}
	
	.campaign-fallback {
		margin: 1rem 0;
		padding: 1rem;
		border: 1px solid #eee;
	}
	
	:global(swiper-container) {
		width: 100%;
		height: auto;
		--swiper-theme-color: #ff3e00;
		--swiper-pagination-bullet-inactive-color: #999;
	}
	
	:global(swiper-slide) {
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	:global(.campaign-slide) {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.3s ease;
	}
	
	:global(.dismiss-all) {
		background-color: #ffe5e5;
	}
	
	:global(.dismiss) {
		background-color: #fff0e0;
	}
	
	:global(.main) {
		background-color: #ffffff;
	}
	
	:global(.participate) {
		background-color: #e0ffe0;
	}
	
	:global(.participate-all) {
		background-color: #d0ffd0;
	}
	
	.action-panel {
		text-align: center;
		padding: 1rem;
	}
	
	.action-panel h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}
	
	.action-panel p {
		margin-bottom: 1.5rem;
		color: #666;
	}
	
	:global(.btn-action) {
		display: inline-block;
		padding: 0.5rem 1rem;
		margin: 0.5rem;
		border: none;
		border-radius: 4px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	:global(.btn-dismiss-all), :global(.btn-dismiss) {
		background-color: #ffcccc;
		color: #990000;
	}
	
	:global(.btn-participate), :global(.btn-participate-all) {
		background-color: #ccffcc;
		color: #006600;
	}
	
	:global(.btn-dismiss-all:hover), :global(.btn-dismiss:hover) {
		background-color: #ffaaaa;
	}
	
	:global(.btn-participate:hover), :global(.btn-participate-all:hover) {
		background-color: #aaffaa;
	}
	
	.campaign-content {
		width: 100%;
	}
	
	.no-campaigns {
		padding: 2rem;
		text-align: center;
		font-style: italic;
		color: #666;
	}
</style>