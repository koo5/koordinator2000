<script>
  import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
  } from 'sveltestrap';

  export let settings_open = false;
  export const toggle_settings = () => (settings_open = !settings_open);
</script>

<Button on:click={toggle_settings}>do not click this button</Button>

<Modal isOpen={settings_open} toggle={toggle_settings} fade={false} keyboard={true} scrollable={true}>
  <ModalHeader {toggle_settings}>hi</ModalHeader>
  <ModalBody>
    hi there
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={toggle_settings}>Close</Button>
  </ModalFooter>
</Modal>
