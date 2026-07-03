<script lang="ts">
    import { getContextClient, gql } from '$lib/urql.ts';
    import type { Campaign } from '$lib/client/my_user.ts';

    // Matches the notifications page subscription selection
    interface CampaignNotification {
        id: number;
        content: string;
        read: boolean;
        ts?: string;
        campaign: Campaign;
    }

    export let notification: CampaignNotification;
    $: campaign = notification ? notification.campaign : undefined;

    const client = getContextClient();

    const MARK_READ = gql`
        mutation MarkRead($id: Int!, $read: Boolean!) {
            update_campaign_notifications_by_pk(pk_columns: { id: $id }, _set: { read: $read }) {
                id
                read
            }
        }
    `;

    async function toggle_read(): Promise<void> {
        try {
            await client.mutation(MARK_READ, { id: notification.id, read: !notification.read }).toPromise();
        } catch (e) {
            console.error('Error toggling notification read state:', e);
        }
    }

    function format_ts(ts: string | undefined): string {
        if (!ts) return '';
        const d = new Date(ts);
        const diff_ms = Date.now() - d.getTime();
        const diff_min = Math.floor(diff_ms / 60000);
        if (diff_min < 1) return 'just now';
        if (diff_min < 60) return `${diff_min}m ago`;
        const diff_h = Math.floor(diff_min / 60);
        if (diff_h < 24) return `${diff_h}h ago`;
        const diff_d = Math.floor(diff_h / 24);
        if (diff_d < 7) return `${diff_d}d ago`;
        return d.toLocaleDateString();
    }
</script>

<li class="notification-item" class:unread={!notification.read}>
    <div class="notification-main">
        <div class="notification-header">
            {#if campaign?.id}
                <a class="link font-semibold" href="/campaign/{campaign.id}">{campaign.title || 'Unknown Campaign'}</a>
            {:else}
                <b>{campaign?.title || 'Unknown Campaign'}</b>
            {/if}
            <span class="notification-ts">{format_ts(notification.ts)}</span>
        </div>
        <div class="notification-content">{notification.content}</div>
    </div>
    <button
        class="btn btn-ghost btn-xs"
        title={notification.read ? 'Mark as unread' : 'Mark as read'}
        on:click={toggle_read}
    >
        {notification.read ? '↩' : '✓'}
    </button>
</li>

<style>
    .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        margin-bottom: 0.5rem;
        background: #fff;
    }

    .notification-item.unread {
        border-left: 4px solid #f59e0b;
        background: #fffbeb;
    }

    .notification-main {
        flex: 1;
        min-width: 0;
    }

    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.5rem;
    }

    .notification-ts {
        font-size: 0.75rem;
        color: #6b7280;
        white-space: nowrap;
    }

    .notification-content {
        margin-top: 0.25rem;
    }
</style>
