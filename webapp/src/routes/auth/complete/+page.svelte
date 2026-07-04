<script lang="ts">
    import { t } from '$lib/i18n';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { apply_newly_authenticated_user } from '$lib/client/my_user';

    export let data: { user?: App.UserObject };

    let status = 'authc.signing_in';

    onMount(async () => {
        if (data?.user && data.user.id > 0) {
            await apply_newly_authenticated_user(data.user);
            status = 'authc.done';
        } else {
            status = 'authc.failed';
        }
        setTimeout(() => goto('/'), 500);
    });
</script>

<div class="content_block">
    <p>{$t(status)}</p>
</div>
