<script lang="ts">
    import { t } from '$lib/i18n';
    import { my_user, nag, postpone_nag } from '$lib/client/my_user.ts';
    import TheNagBody from './TheNagBody.svelte';
    import { modal_hack } from '$lib/client/campaign.ts';

    let isOpen = false;
    $: modal_hack(isOpen);

    nag.on('nag', () => {
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

    function onkeydown(e: KeyboardEvent): void {
        if (isOpen && e.key === 'Escape') later();
    }
</script>

<svelte:window on:keydown={onkeydown} />

<div class="modal" class:modal-open={isOpen} role="dialog" aria-modal="true">
    <div class="modal-box">
        <h3 class="mt-0">{$t('nag.title')}</h3>
        <TheNagBody />
        <div class="modal-action">
            <button class="btn btn-success btn-sm" on:click={success} disabled={success_is_disabled}>{$t('nag.done')}</button>
            <button class="btn btn-ghost btn-sm" on:click={later}>{$t('nag.later')}</button>
            <button class="btn btn-outline btn-warning btn-sm" on:click={never}>{$t('nag.never')}</button>
        </div>
    </div>
    <button class="modal-backdrop" aria-label="Close" on:click={later}></button>
</div>
