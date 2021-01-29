<script type='js'>
	import Campaign from 'cmps/Campaign.svelte';
	import {my_user} from 'srcs/my_user.js';
	import {onMount, onDestroy} from "svelte";
	import * as animateScroll from "svelte-scrollto";
	import ProgressBar from "@okrad/svelte-progressbar";
	import {subscribe, gql} from "srcs/apollo.js";
	import SubscribedItemsInner from 'cmps/SubscribedItemsInner.svelte';


	var my_timeout;
	let series = [20, 16];
	let campaign_containers;


	import {Swiper, SwiperSlide} from 'swiper/svelte';
	import SwiperCore, {EffectFade} from 'swiper';
	import 'swiper/swiper-bundle.css';
	SwiperCore.use([EffectFade]);


	// fixme, the dismissal filter works in hasura console, but not here, for some reason
	const CAMPAIGN_LIST = gql`
		subscription ($_user_id: Int) {
		  campaigns(
				order_by: [{id: asc}],
				where: {
					_and:
					{
						smazano: {_eq: false},
						_not: {campaign_dismissals: {user_id: {_eq: $_user_id}}}
					}
				}
			)
			{
				id,
				title,
				description,
				suggested_lowest_threshold,
				suggested_highest_threshold,
				suggested_optimal_threshold,
				participations(order_by: [{threshold: asc}]) {
				  id
				  threshold
				  user {
					id
					name
				  }
				  confirmed
				  condition_is_fulfilled
				},
				my_participations: participations(where: {user_id: {_eq: $_user_id}}) {
				  id
				  threshold
				  condition_is_fulfilled
				}
				campaign_dismissals {
				  user_id
				  user {
				    id
				  	name
				  }
				}
		  }
		}
  	`;

	$: items = subscribe(
		CAMPAIGN_LIST,
		{
			variables: {
				_user_id: $my_user.id
			}
		}
	);

	function slideChange(x, campaign_id)
	{

		if (my_timeout)
			clearTimeout(my_timeout);

		/*console.log('campaign_id');
		console.log(campaign_id);
		console.log('x.detail[0][0].activeIndex');
		console.log(x.detail[0][0].activeIndex);*/
		if (x.detail[0][0].activeIndex != 2)
		{
			const children = campaign_containers.children;
			var goToNext = false;
			for (var i = 0; i < children.length; i++)
			{
				const ch = children[i];

				if (goToNext)
				{
					my_timeout = setTimeout(() =>
					{
						animateScroll.scrollTo({delay: 0, element: ch});
					}, 2000);
					// hmm this could maybe also be done by navigating to a hash (the element id)
					return;
				}

				const j = ch.dataset.campaignId;
				/*console.log('j');
				console.log(j);*/
				if (campaign_id == j)
					goToNext = true;
			}
		}
	}


</script>

<style>


	:global(.help_tooltip)	{
		background-color: #ffffff;
		padding: 1em;
	}

	:global(.info_tooltip)	{
		background-color: #ffffff;
		padding: 1em;
	}

	.rastrast {
		max-width: 100%;
		word-wrap: break-word;
	}
	:global(.confirmed)	{
		background-color: #88ff88;
	}

	:global(.condition_is_fulfilled)	{
		background-color: #ccffcc;
	}

	:global(.condition_is_not_fulfilled)	{
		background-color: #ffe0e0;
	}


</style>
(swipe like on Tinder!)<br/>

<div bind:this="{campaign_containers}">
<!--<ul bind:this="{campaign_containers}">-->

	<SubscribedItemsInner {items} let:da={data}>

		{#each data.campaigns as campaign (campaign.id)}

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

<!--						preventInteractionOnTransition={true}-->
<!--						effect={'fade'}-->

<!--					<li class="rastrast" data-campaign-id={campaign.id}>-->


					<SwiperSlide>
						<div class="rastrast">
							<button type="submit">participate in all campaigns of this cause</button>
							<button type="submit">participate in all campaigns of this user</button>
						</div>
					</SwiperSlide>

					<SwiperSlide>
						<div class="rastrast">
							<div>PARTICIPATEd. double right:
								See all campaigns of this cause. (button)
							</div>
						</div>
					</SwiperSlide>

					<SwiperSlide>
						<div class="rastrast">
							<Campaign {campaign}/>
						</div>
					</SwiperSlide>

					<SwiperSlide>
						<div class="rastrast">
							<div>DISMISSed. double left: I dont care about this cause, dismiss all campaigns of this
								cause. (button)
							</div>
						</div>
					</SwiperSlide>

					<SwiperSlide>
						<div class="rastrast">
							<button type="submit">dismiss all campaigns of this cause</button>
							<button type="submit">dismiss all campaigns of this user (for ever and ever...)</button>
						</div>
					</SwiperSlide>

<!--				</li>-->
			</Swiper>
		{:else}
			No campaigns found
		{/each}
	</SubscribedItemsInner>
</div>
<!--</ul>-->


<!-- this should show, relative to your set threshold (100%), number of cofirmed and number of unconfirmed participants:
	<svelte:component this={ProgressBar} {series} height={5} showProgressValue={false} />
	<ProgressBar {series} height={5} showProgressValue={false} />
	gotta fix the transition_out bug though.
-->


<!--<div>Current slide is { isActive ? 'active' : 'not active' }</div> -->

<!--
							  <div>
								{JSON.stringify(campaign)}
								  bla.
							  </div>
-->
