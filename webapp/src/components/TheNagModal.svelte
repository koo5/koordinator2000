<script lang="ts">
    import { my_user, nag, postpone_nag } from '../my_user';
    import TheNagBody from './TheNagBody.svelte';
    import { modal_hack } from '../stuff';
    import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from './ui';

    let isOpen = false;
    $: modal_hack(isOpen);

    nag.on(() => {
        //postpone_nag();
        //alert("i'm gonna attempt to show a modal dialog. This seems to break in firefox. In that case, please reload the page.");
        isOpen = true;
    });

    function success(): void {
        isOpen = false;
    }

    // Use a computed property instead of a function for the disabled state
    $: success_is_disabled = !$my_user.email;

    function later(): void {
        isOpen = false;
        postpone_nag();
    }

    function never(): void {
        isOpen = false;
        postpone_nag(999999999999);
    }
</script>

<Modal {isOpen} toggle={later} fadeEffect={false} keyboard={true} scrollable={true}>
    <ModalHeader toggle={later}>Please!</ModalHeader>
    <ModalBody>
        <TheNagBody />
    </ModalBody>
    <ModalFooter>
        <Button color="success" on:click={success} disabled={success_is_disabled}>Done</Button>
        <Button color="secondary" on:click={later}>Remind me later</Button>
        <Button color="warning" on:click={never}>Remind me never</Button>
    </ModalFooter>
</Modal>
