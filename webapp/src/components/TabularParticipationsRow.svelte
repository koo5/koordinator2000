<script lang="ts">
    import { t, tp } from '$lib/i18n';
    import { my_user } from '$lib/client/my_user.ts';

    interface Account {
        id: number;
        name: string;
    }

    interface Participation {
        idx: number;
        threshold: number;
        condition_is_fulfilled?: boolean;
        account: Account;
        [key: string]: any;
    }

    interface Campaign {
        [key: string]: any;
    }

    export let participation: Participation;
    export let campaign: Campaign;

    $: is_me = participation.account.id === $my_user.id;
    $: is_in = !!participation.condition_is_fulfilled;
</script>

<tr class:is-me={is_me}>
    <td class="idx">{participation.idx}</td>
    <td class="who">
        <a href="/users/{participation.account.id}">{participation.account.name}</a>
        {#if is_me}<span class="badge badge-primary badge-xs ml-1">{$t('table.you')}</span>{/if}
    </td>
    <td class="joins" title={$t('table.joins_when_title')}>
        {#if participation.threshold === 0}
            {$t('table.unconditionally')}
        {:else}
            {$tp('table.n_others', participation.threshold)}
        {/if}
    </td>
    <td>
        {#if is_in}
            <span class="status in" title={$t('table.in_title')}>{$t('table.in')}</span>
        {:else}
            <span class="status waiting" title={$t('table.waiting_title')}>{$t('table.waiting')}</span>
        {/if}
    </td>
</tr>

<style>
    tr.is-me td {
        background: color-mix(in oklab, var(--color-primary) 6%, transparent);
    }
    tr.is-me td:first-child {
        box-shadow: inset 3px 0 0 var(--color-primary);
    }
    .idx {
        color: color-mix(in oklab, var(--color-base-content) 40%, transparent);
        font-variant-numeric: tabular-nums;
    }
    .who a {
        color: inherit;
        text-decoration: none;
        font-weight: 500;
    }
    .who a:hover {
        color: var(--color-primary);
    }
    .joins {
        font-variant-numeric: tabular-nums;
    }
    .status {
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
    }
    .status.in {
        color: var(--color-success);
    }
    .status.waiting {
        color: color-mix(in oklab, var(--color-base-content) 45%, transparent);
    }
</style>
