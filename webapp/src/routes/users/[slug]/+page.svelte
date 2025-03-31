<script lang="ts">
    import User from '../../../components/User.svelte';

    interface PageData {
        user_id: number;
    }

    export let data: PageData;

    // Ensure user_id is a number by explicitly converting it
    $: user_id = Number(data.user_id) || 0;
</script>

<User {user_id} />
