<script lang="ts">
	import Campaign from './Campaign.svelte';
	import {my_user, type Campaign as CampaignType} from '../my_user';
	import * as animateScroll from "svelte-scrollto";
	import {gql, subscriptionStore, getContextClient} from "$lib/urql";
	import SubscribedItemsInner from './SubscribedItemsInner.svelte';
	import {CAMPAIGN_FRAGMENT} from '../stuff';
	import { browser } from '$app/environment';
	import type { OperationResultState } from '@urql/core';
	
	// Interface definitions
	interface CampaignQueryResult {
		campaigns: CampaignType[];
	}
	
	interface CampaignQueryStore extends OperationResultState<CampaignQueryResult> {
		data?: CampaignQueryResult;
	}
	
	// Custom slider implementation
	let activeSlideIndex: Record<number, number> = {}; // Track active slide for each campaign

	export let ids: number[];

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

	let my_timeout: ReturnType<typeof setTimeout> | undefined;
	let campaign_containers: HTMLDivElement | null = null;
	$: my_user_id = $my_user.id;

	function changeSlide(campaign_id: number, direction: number): void {
		if (my_timeout) {
			clearTimeout(my_timeout);
		}
		
		// Default to center slide (2) if not yet initialized
		if (activeSlideIndex[campaign_id] === undefined) {
			activeSlideIndex[campaign_id] = 2;
		}
		
		// Calculate new index
		let newIndex = activeSlideIndex[campaign_id] + direction;
		
		// Keep in bounds (0-4 for 5 slides)
		if (newIndex < 0) newIndex = 0;
		if (newIndex > 4) newIndex = 4;
		
		// Update active index
		activeSlideIndex[campaign_id] = newIndex;
		
		// If moved away from center slide (index 2), trigger next campaign
		if (newIndex !== 2) {
			go_to_next_campaign(campaign_id);
		}
	}

	function go_to_next_campaign(current_campaign_id: number): void {
		if (!$my_user.autoscroll)
			return;
		
		// Make sure campaign container exists and get as HTMLElement
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
				
				my_timeout = setTimeout(() => {
					animateScroll.scrollTo({delay: 0, element: next_ch});
				}, 500);
				
				return; // hmm this could maybe also be done by navigating to a hash (the element id)
			}
		}
	}

</script>

items: {JSON.stringify(ids)}


<div bind:this="{campaign_containers}">

	<SubscribedItemsInner items={campaigns_query} let:da={itemsData}>

		{#each itemsData.campaigns as campaign (campaign.id)}

			{#if browser}
			<div class="campaign-slider" data-campaign-id={campaign.id}>
				<div class="slider-controls">
					<button class="slider-arrow left" on:click={() => changeSlide(campaign.id, -1)}>←</button>
					<button class="slider-arrow right" on:click={() => changeSlide(campaign.id, 1)}>→</button>
				</div>

				activeSlideIndex[campaign.id]={activeSlideIndex[campaign.id]}

				<div class="slider-container">
					<div class="slider-track" style="transform: translateX({activeSlideIndex[campaign.id] !== undefined ? (2 - activeSlideIndex[campaign.id]) * 100 : 0}%)">
						<!-- Slide 0: Far Left -->
						<div class="campaign_swiper_slide slide">
							(TODO.)
							<button type="submit">dismiss all campaigns of this cause</button>
							<button type="submit">dismiss all campaigns of this user (for ever and ever...)</button>
						</div>
						
						<!-- Slide 1: Left -->
						<div class="campaign_swiper_slide slide">
							<div>(TODO.) DISMISSed. double left: I dont care about this cause, dismiss all campaigns of this
								cause. (button)
							</div>
						</div>
						
						<!-- Slide 2: Center (Main) -->
						<div class="campaign_swiper_slide slide">
						<li>
							<Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)}/>
						</li>
						</div>
						
						<!-- Slide 3: Right -->
						<div class="campaign_swiper_slide slide">
							<div>(TODO.) PARTICIPATEd. double right:
								See all campaigns of this cause. (button)
							</div>
						</div>
						
						<!-- Slide 4: Far Right -->
						<div class="campaign_swiper_slide slide">
							(TODO.)
							<button type="submit">participate in all campaigns of this cause</button>
							<button type="submit">participate in all campaigns of this user</button>
						</div>
					</div>
				</div>
			</div>
			{:else}
			<!-- SSR fallback to show campaigns without sliders -->
			<div class="campaign_swiper_slide ssr-fallback">
				<li>
					<Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)}/>
				</li>
			</div>
			{/if}

		{:else}
			No campaigns found
		{/each}
	</SubscribedItemsInner>
</div>


<style>

	:global(.info_tooltip) {
		/*background-color: #cccccc;*/
		padding: 1em;
	}

	.campaign_swiper_slide {
		max-width: 100%;
		word-wrap: break-word;
	}

	.ssr-fallback {
		margin: 1rem 0;
		padding: 1rem;
		border: 1px solid #eee;
	}

	:global(.confirmed) {
		background-color: #aaffaa;
	}

	:global(.condition_is_fulfilled) {
		background-color: #ccffcc;
		/*background-color: #ccffcc;*/
	}

	:global(.condition_is_not_fulfilled) {
		background-color: #ffffcc;
	}

	/* Custom slider styles */
	.campaign-slider {
		position: relative;
		width: 100%;
		margin: 1rem 0;
		overflow: hidden;
	}

	.slider-controls {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		z-index: 10;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.slider-arrow {
		background: rgba(0, 0, 0, 0.3);
		color: white;
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
		margin: 0 10px;
		pointer-events: auto;
	}

	.slider-container {
		overflow: hidden;
		position: relative;
	}

	.slider-track {
		display: flex;
		transition: transform 0.5s ease;
	}

	.slide {
		flex: 0 0 100%;
		padding: 1rem;
		border: 1px solid #eee;
		transition: opacity 0.3s ease;
	}

</style>