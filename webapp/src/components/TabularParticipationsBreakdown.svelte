<script lang="ts">
    //import {my_user} from '../my_user.ts';
    import TabularParticipationsRow from './TabularParticipationsRow.svelte';
    import type { Campaign, Participation } from '../my_user.ts';

    export let campaign: Campaign;

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

<table class="responsive">
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">user</th>
            <th scope="col">wants</th>
            <th scope="col">status</th>
        </tr>
    </thead>
    <tbody>
        {#each le as participation (participation.idx)}
            <TabularParticipationsRow {participation} {campaign} />
        {/each}
        <tr style="font-weight:bold">
            <td colspan="4">
                <b>
                    <center>
                        {#if remaining > 0}
                            {remaining} more people with default threshold needed, to reach the goal of {suggested_participants} participants
                        {:else}
                            — — — goal of {suggested_participants} participants reached! — — —
                        {/if}
                    </center>
                </b>
            </td>
        </tr>
        {#each gt as participation (participation.idx)}
            <TabularParticipationsRow {participation} {campaign} />
        {/each}
    </tbody>
</table>

<style>
    table {
        margin: 0;
        border: 1px inset rgba(128, 110, 164, 0.48);

        border-radius: 0px 17px 12px 13px;
        border-collapse: separate;
        border-spacing: 1em 0;
    }

    table thead th {
        border-bottom: 1px solid #000;
    }
</style>
