<script type='js'>
	import Campaign from 'src/components/Campaign.svelte';
	import {my_user} from 'src/my_user.js';
	import * as animateScroll from "svelte-scrollto";
	import {subscribe, gql} from "src/apollo.js";
	import SubscribedItemsInner from 'src/components/SubscribedItemsInner.svelte';
	import {CAMPAIGN_FRAGMENT} from 'src/stuff.js';
	import {Swiper, SwiperSlide} from 'swiper/svelte';
	import SwiperCore, {EffectFade} from 'swiper';
	import 'swiper/swiper-bundle.css';


	export let ids;

	// fixme, the dismissal filter works in hasura console, but not here, for some reason (still?)
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

	$: campaigns_query = subscribe(
		CAMPAIGN_LIST,
		{
			variables: {
				_user_id: my_user_id,
				_ids: ids,
			}
		}
	);


	let sorted_campaigns = [];
	$: sorted_campaigns = sort_campaigns(ids, $campaigns_query);
	function sort_campaigns(ids, query_store)
	{
		if (query_store.loading)
			return [];
		let data = query_store.data;
			if (!data) return [];
		let campaigns = query_store.data.campaigns;
		let by_ids = {}
		campaigns.forEach((c) =>
		{
			by_ids[c.id] = c
		});
		let result = [];
		ids.forEach((id) =>
		{
			result.push(by_ids[id]);
		})
		return result;
	}


	var my_timeout;
	let campaign_containers;
	$: my_user_id = $my_user.id



	SwiperCore.use([EffectFade]);
	function slideChange(x, campaign_id)
	{

		if (my_timeout)
			clearTimeout(my_timeout);

		/*console.log('campaign_id');
		console.log(campaign_id);
		console.log('x.detail[0][0].activeIndex');
		console.log(x.detail[0][0].activeIndex);*/
		if (!x) return;
		if (!x.detail) return;
		if (!x.detail[0]) return;
		if (!x.detail[0][0]) return;
		if (x.detail[0][0].activeIndex == undefined) return;
		if (x.detail[0][0].activeIndex != 2)
			go_to_next_campaign(campaign_id);

	}

	function go_to_next_campaign(current_campaign_id)
	{
		if (!$my_user.autoscroll)
			return;
		if (!campaign_containers) return;
		if (!campaign_containers.children) return;
		const children = campaign_containers.children;
		var goToNext = false;
		for (var i = 0; i < children.length; i++)
		{
			const ch = children[i];
			if (!ch.dataset) return;
			const j = ch.dataset.campaignId;
			if (current_campaign_id == j)
			{
				const next_ch = children[i+1];
				if (!next_ch) return;
				my_timeout = setTimeout(() =>
				{
					animateScroll.scrollTo({delay: 0, element: next_ch});
				}, 500);
				return; // hmm this could maybe also be done by navigating to a hash (the element id)
			}
		}
	}

</script>


{ids}:
<div bind:this="{campaign_containers}">

	<SubscribedItemsInner items={campaigns_query}>

		{#each sorted_campaigns as campaign (campaign.id)}

			<Swiper data-campaign-id={campaign.id}
					threshold={60}
					initialSlide={2}
					slidesPerView={1}
					spaceBetween={0}
					grabCursor={true}
					watchOverflow={true}
					speed={1500}
					freeModeMomentum={false}
					fadeEffect={ {crossFade: true} }
					on:slideChange={(x) => slideChange(x,campaign.id)}
			>
				<SwiperSlide>
					<div class="campaign_swiper_slide">
						(TODO.)
						<button type="submit">participate in all campaigns of this cause</button>
						<button type="submit">participate in all campaigns of this user</button>
					</div>
				</SwiperSlide>

				<SwiperSlide>
					<div class="campaign_swiper_slide">
						<div>(TODO.) PARTICIPATEd. double right:
							See all campaigns of this cause. (button)
						</div>
					</div>
				</SwiperSlide>

				<SwiperSlide>

					<div class="campaign_swiper_slide">
					<li>
						<Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)}/>
					</li>
					</div>

				</SwiperSlide>

				<SwiperSlide>
					<div class="campaign_swiper_slide">
						<div>(TODO.) DISMISSed. double left: I dont care about this cause, dismiss all campaigns of this
							cause. (button)
						</div>
					</div>
				</SwiperSlide>

				<SwiperSlide>
					<div class="campaign_swiper_slide">
						(TODO.)
						<button type="submit">dismiss all campaigns of this cause</button>
						<button type="submit">dismiss all campaigns of this user (for ever and ever...)</button>
					</div>
				</SwiperSlide>

			</Swiper>

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


</style>
