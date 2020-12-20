<script>
	import gql from 'graphql-tag';
	import {client} from './apollo';
	import {subscribe} from 'svelte-apollo';
	import Campaign from './Campaign.svelte';
	import {my_user} from './my_user';




	import ProgressBar from "@okrad/svelte-progressbar";
	let series = [20,16];


	// Import Swiper Svelte components
	import { Swiper, SwiperSlide } from 'swiper/svelte';

	// Import Swiper styles
	import 'swiper/swiper.scss';





	const CAMPAIGN_LIST = gql`
    subscription ($_user_id: Int) {
      campaigns(order_by: [{id: asc}], where: {smazano: {_eq: false}}) {
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
      }
    }
  `;

	function maybe_subscribe(my_user)
	{
		var my_user_id;
		if (my_user)
			my_user_id = my_user.id
		else
			my_user_id = 0;
		return subscribe(client, {
				query: CAMPAIGN_LIST,
				variables: {
					_user_id: my_user_id
				}
			}
		)
	}

	$: campaigns = maybe_subscribe($my_user);

</script>


<ul>
	{#await $campaigns}
		<li>Loading...</li>
	{:then result}


		<ProgressBar {series} height={2} showProgressValue=false />
		<button on:click={() => series = [50, 50]}>fill</button>
		<button on:click={() => series = [0, 0]}>clear</button>


		{#each result.data.campaigns as campaign (campaign.id)}
			<Swiper
					grabCursor={true}
					watchOverflow={true}
					effect={'fade'}
					speed={150}
				initialSlide={1}
				spaceBetween={50}
				slidesPerView={3}
				on:slideChange={() => console.log('slide change')}
				on:swiper={(e) => console.log(e.detail[0])}
			>
			  <SwiperSlide>DISMISS</SwiperSlide>
			  <SwiperSlide>
				  <Campaign {campaign}/>
			  </SwiperSlide>
			  <SwiperSlide>PARTICIPATE</SwiperSlide>
			</Swiper>
		{:else}
			<li>No campaigns found</li>
		{/each}


		<hr><hr><hr><hr><hr><hr>

		{#each result.data.campaigns as campaign (campaign.id)}
			<Campaign {campaign}/>
		{:else}
			<li>No campaigns found</li>
		{/each}

	{:catch error}
		<li>Error loading campaigns:
			<pre>{JSON.stringify(error, null, '  ')}</pre>
		</li>
	{/await}
</ul>

