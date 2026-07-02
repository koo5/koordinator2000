<script lang="ts">
    import type { Campaign } from '$lib/client/my_user.ts';

    // Define the notification interface based on the GraphQL schema
    interface CampaignNotification {
        id: number;
        content: string;
        read: boolean;
        campaign: Campaign;
    }

    export let notification: CampaignNotification;
    $: campaign = notification ? notification.campaign : undefined;
</script>

<li><b>{campaign?.title || 'Unknown Campaign'}</b></li>

<span class={notification.read ? 'notification-read' : 'notification-unread'}>{notification.content}</span>

<style>
    .notification-unread {
        background-color: yellow;
    }
</style>
