<script lang="js">
    export let dismissal;
</script>

{#if dismissal.account}

<span class="dismissal">
    👎<a href="/users/{dismissal.account.id}">{dismissal.account.name}</a>
</span>

{:else}

    ?

{/if}
<style>
    .dismissal {
        background-color: rgb(210, 210, 255);
    }
</style>
