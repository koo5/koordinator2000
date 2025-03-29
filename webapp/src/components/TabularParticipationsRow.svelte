<script>
  import ToolTipsy from './ToolTipsy.svelte';
  import {get_status_class,get_tickmark,short_description,long_description} from '../stuff.ts';
  import {my_user} from '../my_user.ts';


  export let participation;
  export let campaign;


</script>

<tr>
  <td class={get_status_class(participation, campaign?.collect_confirmations)}>{participation.idx}</td>

  <td><a href="/users/{participation.account.id}">{participation.account.name}</a></td>

  <td>
    <ToolTipsy>{participation.threshold}
      <div slot="tooltip" class="info_tooltip">
        The number of other users that must start participating, before this user starts.
        {participation.threshold} other users must start first.
      </div>
    </ToolTipsy>
  </td>

  <td>
    <ToolTipsy enabled="{!$my_user.hide_help}">
    {get_tickmark(participation, campaign?.collect_confirmations)} - {short_description(participation, campaign?.collect_confirmations)}
    <div slot="tooltip">
      <div class="help_tooltip">
        {long_description(participation, campaign?.collect_confirmations)}
      </div>
    </div>
    </ToolTipsy>
  </td>
</tr>
