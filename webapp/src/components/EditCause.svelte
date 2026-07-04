<script lang="ts">
    /**
     * Maintainer edit form for a cause (title + description). Replaced the old
     * Firepad/Firebase collaborative editor, which never actually saved and
     * loaded third-party scripts on every page. Uses update_causes_by_pk; Hasura
     * scopes the write to the maintainer.
     */
    import { t } from '$lib/i18n';
    import { onMount } from 'svelte';
    import { getContextClient, gql } from '$lib/urql.ts';
    import { goto } from '$app/navigation';
    import { my_user } from '$lib/client/my_user.ts';

    export let id: string;

    const client = getContextClient();
    const cause_id = parseInt(id, 10);

    let title = '';
    let description = '';
    let maintainer_id: number | null = null;
    let found = false;
    let loading = true;
    let saving = false;
    let error = false;

    // Only the cause's maintainer may edit. Hasura already blocks the write for
    // anyone else; this gates the UI too, so a non-owner doesn't see a dead-end
    // form (mirrors campaign editing's is_maintainer check).
    $: is_maintainer = found && $my_user?.id > 0 && $my_user.id === maintainer_id;

    const FETCH = gql`
        query Cause($id: Int!) {
            causes_by_pk(id: $id) {
                id
                title
                description
                maintainer_id
            }
        }
    `;
    const UPDATE = gql`
        mutation UpdateCause($id: Int!, $title: String, $description: String) {
            update_causes_by_pk(pk_columns: { id: $id }, _set: { title: $title, description: $description }) {
                id
            }
        }
    `;

    onMount(async () => {
        const res = await client.query(FETCH, { id: cause_id }).toPromise();
        const c = res.data?.causes_by_pk;
        if (c) {
            found = true;
            title = c.title ?? '';
            description = c.description ?? '';
            maintainer_id = c.maintainer_id ?? null;
        }
        loading = false;
    });

    async function save(): Promise<void> {
        saving = true;
        error = false;
        try {
            const res = await client.mutation(UPDATE, { id: cause_id, title, description }).toPromise();
            if (res.error || !res.data?.update_causes_by_pk) {
                error = true;
            } else {
                goto('/campaigns');
            }
        } catch (e) {
            console.error('cause update failed', e);
            error = true;
        } finally {
            saving = false;
        }
    }
</script>

<div class="cause-wrap">
    {#if loading}
        <p class="opacity-60">{$t('cause.loading')}</p>
    {:else if !found}
        <h3 class="mt-0">{$t('cause.not_found')}</h3>
        <a class="btn btn-primary btn-sm mt-2" href="/campaigns">{$t('detail.more')}</a>
    {:else if !is_maintainer}
        <!-- Read-only view for non-maintainers (Hasura also blocks the write). -->
        <h3 class="mt-0">{title}</h3>
        <p class="whitespace-pre-wrap">{description}</p>
        <p class="mt-4 text-sm opacity-60">{$t('cause.not_yours')}</p>
        <a class="btn btn-ghost btn-sm mt-1" href="/campaigns">{$t('detail.more')}</a>
    {:else}
        <h3 class="mt-0">{$t('cause.edit_title')}</h3>
        <form on:submit|preventDefault={save} class="flex flex-col gap-4">
            <label class="form-control w-full">
                <span class="label-text font-medium mb-1 block">{$t('cause.title_label')}</span>
                <input class="input input-bordered w-full" type="text" bind:value={title} placeholder={$t('cause.title_ph')} required />
            </label>

            <label class="form-control w-full">
                <span class="label-text font-medium mb-1 block">{$t('cause.desc_label')}</span>
                <textarea class="textarea textarea-bordered w-full" rows="6" bind:value={description} placeholder={$t('cause.desc_ph')}></textarea>
            </label>

            {#if error}
                <div class="alert alert-error"><span>{$t('cause.error')}</span></div>
            {/if}

            <div>
                <button class="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? $t('cause.saving') : $t('cause.save')}
                </button>
            </div>
        </form>
    {/if}
</div>

<style>
    .cause-wrap {
        max-width: 40rem;
        margin: 0 auto;
        background: var(--color-base-100);
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        padding: 1.75rem;
    }
</style>
