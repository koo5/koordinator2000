<script context="module">
  export async function preload({ params }) {
    return {id: params.slug}
  }
</script>

<script lang='js'>

  import EditCause from '../../components/EditCause.svelte';

  export let id;


</script>

<EditCause {id}></EditCause>

