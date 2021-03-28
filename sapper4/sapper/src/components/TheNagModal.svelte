<script>
	import {my_user,nag} from 'srcs/my_user.js';
	import Settings from 'cmps/Settings.svelte';
	import TheNagBody from 'cmps/TheNagBody.svelte';

	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'sveltestrap';


	export let isOpen = false;
	nag.on(() => isOpen = true);

	function success()
	{
		isOpen = false;
	}

	function success_is_disabled()
	{
		return !$my_user.email;
	}

	function later()
	{
		isOpen = false;
		let backoff = ($my_user.nag_backoff || 0);
		$my_user.nag_postponement += 3 + backoff;
		$my_user.nag_backoff = backoff + 15;
	}

	function never()
	{
		isOpen = false;
		$my_user.nag_postponement = 999999999999;
	}


</script>



<Modal {isOpen} {later} fade={true} keyboard={true} scrollable={true}>
	<ModalHeader {later}>Settings</ModalHeader>
	<ModalBody>
		<TheNagBody/>
	</ModalBody>
	<ModalFooter>
		<Button color="success" on:click={success} disabled={success_is_disabled} >Done</Button>
		<Button color="secondary" on:click={later}>Remind me later</Button>
		<Button color="warning" on:click={never}>Remind me never</Button>
	</ModalFooter>
</Modal>
