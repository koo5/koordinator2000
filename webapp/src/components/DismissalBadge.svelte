<script lang='ts'>
  import type { CampaignDismissal } from '../types';

  // Svelte 5 runes style with TypeScript
  const props = $props<{
    dismissal: CampaignDismissal;
  }>();
  
  // Derived values using runes
  const accountId = $derived(props.dismissal.account.id);
  const accountName = $derived(props.dismissal.account.name);
</script>

<span class="dismissal">
  👎<a href="/users/{accountId}">{accountName}</a>
</span>

<style>
  .dismissal {
    background-color: rgb(210,210,255);
    border-radius: 4px;
    padding: 2px 4px;
    margin: 0 2px;
  }
</style>