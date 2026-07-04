<script>
    import MutationForm from '../../components/MutationForm.svelte';
    import gql from 'graphql-tag';
    import { my_user } from '$lib/client/my_user.ts';
    import { goto } from '$app/navigation';
    import { t } from '$lib/i18n';
</script>

<p class="opacity-70">{$t('cause.intro')}</p>

<MutationForm
    mutation={gql`
        mutation MyMutation($maintainer_id: Int) {
            insert_causes_one(object: { maintainer_id: $maintainer_id }) {
                id
            }
        }
    `}
    variables={{
        maintainer_id: $my_user.id,
    }}
    on:done={result => {
        console.log(result);
        goto('/edit_cause/' + result['detail']['data']['insert_causes_one']['id']);
    }}
>
    <button class="btn btn-primary btn-sm" type="submit">{$t('cause.submit')}</button>
</MutationForm>
