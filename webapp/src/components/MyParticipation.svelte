<script lang="ts">
    import { Button, Input, Label } from './ui';
    // Label and Input not implemented yet
    import { type Campaign, decrease_auth_nag_postponement, get_my_participation, my_user, type MyUser } from '$lib/client/my_user.ts';
    import gql from 'graphql-tag';
    import MutationForm from './MutationForm.svelte';
    import { createEventDispatcher } from 'svelte';
    import { get_tickmark } from '$lib/client/campaign.ts';

    const dispatch = createEventDispatcher();

    export let campaign: Campaign;
    let new_threshold = campaign.suggested_optimal_threshold;
    $: my_participation = get_my_participation(campaign, $my_user);
    $: update_new_threshold_when_user_changes($my_user);

    function update_new_threshold_when_user_changes(u: MyUser): void {
        console.log('update_new_threshold_when_user_changes', u);
        if (my_participation.threshold != undefined) new_threshold = my_participation.threshold;
    }

    $: console.log("new_threshold:", new_threshold);

    $: update_button_disabled = my_participation.threshold == new_threshold;

    const UPSERT = gql`
        mutation MyMutation($campaign_id: Int, $user_id: Int, $threshold: Int) {
            insert_participations(objects: { campaign_id: $campaign_id, account_id: $user_id, threshold: $threshold }, on_conflict: { constraint: participations_campaign_id_user_id, update_columns: threshold }) {
                affected_rows
            }
        }
    `;

    $: upsert_vars = {
        campaign_id: campaign.id,
        user_id: $my_user.id,
        threshold: new_threshold,
    };

    function on_participated() {
        dispatch('my_participation_upsert');
        decrease_auth_nag_postponement();
    }
</script>

minimum suggested: {campaign.suggested_lowest_threshold}<br />

{#if my_participation.id}
    <MutationForm on:done={() => dispatch('my_participation_upsert')} mutation={UPSERT} variables={upsert_vars}>
        <Label
            >My threshold:
            <Input type="number" placeholder={campaign.suggested_optimal_threshold} maxlength="10" min="0" max="9999999999" bind:value={new_threshold} />
        </Label>
        <Button color="success" type="submit" disabled={update_button_disabled}>Update</Button>

        <MutationForm
            on:done={() => dispatch('my_participation_upsert')}
            mutation={gql`
                mutation MyMutation($id: Int!) {
                    delete_participations_by_pk(id: $id) {
                        id
                    }
                }
            `}
            variables={{
                id: my_participation.id,
            }}
        >
            <Button color="secondary" class="inline" type="submit">Delete</Button>
        </MutationForm>
    </MutationForm>
{:else}
    <MutationForm on:done={() => on_participated()} css_ref="inline" mutation={UPSERT} variables={upsert_vars}>
        <Label
            >My threshold:
            <Input type="number" placeholder={campaign.suggested_optimal_threshold} min="0" max="9999999999" bind:value={new_threshold} />
        </Label>
        <Button color="primary" type="submit">Participate</Button>
        <br />
    </MutationForm>
{/if}

<br />maximum suggested:{campaign.suggested_highest_threshold}

<p>
    {get_tickmark(my_participation, campaign.collect_confirmations)}
    {#if my_participation.threshold != undefined}
        {#if my_participation.condition_is_fulfilled}
            {#if !campaign.collect_confirmations || my_participation.confirmed}
                <span class="confirmed"
                    >My participation is {campaign.collect_confirmations ? 'confirmed' : 'active'}
                    .</span
                >
            {:else}
                <span class="condition_is_fulfilled">My threshold is reached, waiting for <a href="/notifications">confirmation.</a></span>
            {/if}
        {:else}
            <span class="condition_is_not_fulfilled">I'm waiting for more people</span>
        {/if}
    {:else}
        I'm not participating.
    {/if}
</p>

<style>
</style>
