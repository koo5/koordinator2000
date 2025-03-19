<script>
	import {my_user} from 'src/my_user.js';
	import Settings from 'src/components/Settings.svelte';
	import {modal_hack} from 'src/stuff.js';

	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'sveltestrap';

	export let settings_open = false;
	$: modal_hack(settings_open);
	export const toggle_settings = () => (settings_open = !settings_open);

</script>

<Modal isOpen={settings_open} toggle={toggle_settings} fade={false} keyboard={true} scrollable={true}>
	<ModalHeader {toggle_settings}>Settings</ModalHeader>
	<ModalBody>
		<Settings/>
	</ModalBody>
	<ModalFooter>
		<Button color="secondary" on:click={toggle_settings}>Close</Button>
	</ModalFooter>
</Modal>
