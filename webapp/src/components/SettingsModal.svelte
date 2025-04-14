<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Settings from './Settings.svelte';

    export let isOpen = false;

    const dispatch = createEventDispatcher<{
        close: void;
    }>();

    function closeModal(): void {
        dispatch('close');
    }

    // Close modal when Escape key is pressed
    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape' && isOpen) {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="modal modal-open z-50" role="dialog">
        <div class="modal-box w-11/12 max-w-xl relative z-50">
            <div class="flex justify-between items-center border-b pb-3 mb-3">
                <h2 class="text-xl font-semibold">Settings</h2>
                <button class="btn btn-sm btn-circle" on:click={closeModal}>✕</button>
            </div>
            <div>
                <Settings />
            </div>
        </div>
        <label class="modal-backdrop" on:click={closeModal}></label>
    </div>
{/if}
