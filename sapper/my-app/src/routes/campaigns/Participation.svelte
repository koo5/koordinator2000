<script>
    export let participation;
	import { request_queue } from '../../request_queue.js';
    import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();

</script>


<div class='content'>
	Your threshold: <input type="text" name="threshold"\>
	<button on:click={onClickUpdate}>update</button>
	recommended: {participation.recommended_threshold}
</div>


