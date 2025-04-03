<script lang="ts">
    import MutationForm from './MutationForm.svelte';
    import { gql } from '$lib/urql.ts';
    import type { Campaign, Participation } from '$lib/client/my_user.ts';

    // Define the notification interface based on the GraphQL schema
    interface CampaignNotification {
        id: number;
        content: string;
        read: boolean;
        campaign: Campaign;
    }

    export let notification: CampaignNotification;
    let confirmed: boolean = false;

    $: update_confirmed_there(confirmed);
    $: update_confirmed_here(my_participation);
    $: my_participation = my_participations ? my_participations[0] : undefined;
    $: my_participations = campaign ? campaign.my_participations : undefined;
    $: campaign = notification ? notification.campaign : undefined;

    function update_confirmed_there(confirmed: boolean): void {
        if (!my_participation) return;
        if (confirmed === my_participation.confirmed) return;
        console.log(JSON.stringify(my_participation, null, 2));
    }

    function update_confirmed_here(my_participation: Participation | undefined): void {
        if (my_participation) confirmed = !!my_participation.confirmed;
    }

    async function del(): Promise<void> {
        // This function is empty in the original code
    }
</script>

<li><b>{campaign?.title || 'Unknown Campaign'}</b></li>

<span class={notification.read ? 'notification-read' : 'notification-unread'}>{notification.content}</span>

{#if my_participation}
    <MutationForm
        mutation={gql`
            mutation MyMutation($id: Int!, $confirmed: Boolean) {
                update_participations_by_pk(pk_columns: { id: $id }, _set: { confirmed: $confirmed }) {
                    threshold
                }
            }
        `}
        variables={{
            confirmed: confirmed,
            id: my_participation.id,
        }}
    >
        <label for="confirmed-checkbox{notification.id}">
            {#if confirmed}
                confirmed:
            {:else}
                confirm:
            {/if}
        </label>

        <input id="confirmed-checkbox{notification.id}" type="checkbox" bind:checked={confirmed} />
        <button type="submit">save</button>
    </MutationForm>
{/if}

<style>
    .notification-unread {
        background-color: yellow;
    }
</style>
