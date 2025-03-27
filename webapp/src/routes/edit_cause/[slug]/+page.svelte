<script>
  import EditCause from '../../../components/EditCause.svelte';
  export let data;
  const { id } = data;
</script>

<EditCause {id}></EditCause>