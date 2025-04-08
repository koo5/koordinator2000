<script lang="ts">
    import ToolTipsy from './ToolTipsy.svelte';
    import { get_status_class, get_tickmark, long_description, short_description } from '$lib/client/campaign.ts';
    import { my_user } from '$lib/client/my_user.ts';

    interface Account {
        id: number;
        name: string;
    }

    interface Participation {
        idx: number;
        threshold: number;
        account: Account;
        [key: string]: any;
    }

    interface Campaign {
        collect_confirmations?: boolean;
    }

    export let participation: Participation;
    export let campaign: Campaign;
</script>

<tr>
    <td class={get_status_class(participation, campaign?.collect_confirmations)}>{participation.idx}</td>

    <td><a href="/users/{participation.account.id}">{participation.account.name}</a></td>

    <td>
        <ToolTipsy
            >{participation.threshold}
            <div slot="tooltip" class="info_tooltip">
                The number of other users that must start participating, before this user starts.
                {participation.threshold} other users must start first.
            </div>
        </ToolTipsy>
    </td>

    <td>
        <ToolTipsy enabled={!$my_user.hide_help}>
            {get_tickmark(participation, campaign?.collect_confirmations)}
            - {short_description(participation, campaign?.collect_confirmations)}
            <div slot="tooltip">
                <div class="help_tooltip">
                    {long_description(participation, campaign?.collect_confirmations)}
                </div>
            </div>
        </ToolTipsy>
    </td>
</tr>
