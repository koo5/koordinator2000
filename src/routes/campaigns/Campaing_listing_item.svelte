
<script>

    export let campaign;

	import { request_queue } from '../../request_queue.js';

    import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

    async function onClickParticipate() {
        request_queue.put(
			{
				'verb':"put",
				'url': `participations`,
				//'token': (user && user.token)
			}
		)
		dispatch('message', {
			text: 'participation_started'
        });
		dispatch("participation_started");
	}


</script>


<h3><a rel='prefetch' href='campaigns/{campaign.slug}'>{campaign.title}</a></h3>

<div class='content'>
	{@html campaign.html_description}
	<button on:click={onClickParticipate}>participate</button>
	<p></p>
</div>


