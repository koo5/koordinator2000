<script lang="ts">
    import { t, tp } from '$lib/i18n';
    //import {my_user} from '../my_user.ts';
    import TabularParticipationsRow from './TabularParticipationsRow.svelte';
    import type { Participation as BaseParticipation } from '$lib/client/my_user.ts';

    export let campaign: any;

    interface Participation extends BaseParticipation {
        account: {
            id: number;
            name: string;
        };
        threshold: number;
        condition_is_fulfilled: boolean;
    }

    interface ParticipationWithIndex extends Participation {
        idx: number;
    }

    $: participations = add_idxs(campaign.participations || []);

    function add_idxs(participations: Participation[]): ParticipationWithIndex[] {
        let i = 1;
        return participations.map(participation => ({ ...participation, idx: i++ }));
    }

    $: suggested_participants = campaign.suggested_optimal_threshold + 1;
    $: remaining = suggested_participants - le.length;
    $: le = participations.filter(f);
    $: gt = participations.filter(participation => !f(participation));

    function f(participation: ParticipationWithIndex): boolean {
        return participation.idx <= suggested_participants && (participation.threshold || 0) <= (campaign.suggested_optimal_threshold || 0);
    }
</script>

<table class="table table-sm ptable">
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">{$t('table.who')}</th>
            <th scope="col">{$t('table.joins_when')}</th>
            <th scope="col">{$t('table.status')}</th>
        </tr>
    </thead>
    <tbody>
        {#each le as participation (participation.idx)}
            <TabularParticipationsRow {participation} {campaign} />
        {/each}
        <tr class="goal-row">
            <td colspan="4">
                {#if remaining > 0}
                    {$t('table.goal_more', { n: remaining, m: suggested_participants })}
                {:else}
                    {$t('table.goal_reached', { m: suggested_participants })}
                {/if}
            </td>
        </tr>
        {#each gt as participation (participation.idx)}
            <TabularParticipationsRow {participation} {campaign} />
        {/each}
    </tbody>
</table>

<style>
    .ptable {
        max-width: 32rem;
        margin: 0;
    }
    .ptable thead th {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: color-mix(in oklab, var(--color-base-content) 45%, transparent);
        border-bottom: 1px solid var(--color-base-300);
    }
    .goal-row td {
        text-align: center;
        font-size: 0.85rem;
        font-weight: 600;
        color: color-mix(in oklab, var(--color-base-content) 65%, transparent);
        background: color-mix(in oklab, var(--color-base-200) 70%, transparent);
        border-top: 2px dashed var(--color-base-300);
        border-bottom: 2px dashed var(--color-base-300);
    }
</style>
