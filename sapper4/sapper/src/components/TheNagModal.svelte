<script>
	import {my_user,nag,postpone_nag} from 'srcs/my_user.js';
	import Settings from 'cmps/Settings.svelte';
	import TheNagBody from 'cmps/TheNagBody.svelte';
	import {modal_hack} from 'srcs/stuff.js';
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'sveltestrap';

	let isOpen = false;
	$: modal_hack(isOpen);

	nag.on(() =>
		{
			//postpone_nag();
			//alert("i'm gonna attempt to show a modal dialog. This seems to break in firefox. In that case, please reload the page.");
			isOpen = true;
		}
	);

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
		postpone_nag();
	}

	function never()
	{
		isOpen = false;
		postpone_nag(999999999999);
	}

</script>


<Modal {isOpen} toggle={later} fade={false} keyboard={true} scrollable={true}>
	<ModalHeader toggle={later}>Please!</ModalHeader>
	<ModalBody>
		<TheNagBody/>
	</ModalBody>
	<ModalFooter>
		<Button color="success" on:click={success} disabled={success_is_disabled} >Done</Button>
		<Button color="secondary" on:click={later}>Remind me later</Button>
		<Button color="warning" on:click={never}>Remind me never</Button>
	</ModalFooter>
</Modal>
