<script lang="ts">
    import MutationForm from '../../components/MutationForm.svelte';
    import gql from 'graphql-tag';
    import { goto } from '$app/navigation';
    import { t } from '$lib/i18n';

    // maintainer_id is a server-side preset (X-Hasura-User-Id) on the causes
    // insert permission, so the client inserts an empty row (title/description
    // default to '') and fills them in on the edit page.
</script>

<svelte:head>
    <title>{$t('nav.start_campaign')} - Koordinator</title>
</svelte:head>

<div class="content_block" style="max-width:40rem;margin:0 auto;">
    <p class="opacity-70">{$t('cause.intro')}</p>

    <MutationForm
        mutation={gql`
            mutation AddCause {
                insert_causes_one(object: {}) {
                    id
                }
            }
        `}
        variables={{}}
        on:done={event => {
            const id = event.detail?.data?.insert_causes_one?.id;
            if (id) goto('/edit_cause/' + id);
        }}
    >
        <button class="btn btn-primary btn-sm" type="submit">{$t('cause.submit')}</button>
    </MutationForm>
</div>
