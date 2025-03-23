import {my_user} from 'src/my_user.js';
import {gql} from "src/apollo.js";
import sanitizeHtml from 'sanitize-html';
import {readable, writable, get} from 'svelte/store';
import {browser} from '$app/environment';

export function sanitize_html(x)
{
	return sanitizeHtml(x, {disallowedTagsMode: 'escape'});
//	return x;
}

export const CAMPAIGN_FRAGMENT = `
		{
			id,
			title,
			stealth,
			description,
			suggested_lowest_threshold,
			suggested_highest_threshold,
			suggested_optimal_threshold,
			participations(order_by: [{threshold: asc}], where:{ account:{smazano:{_eq: false}}} ) {
			  id
			  threshold
			  account {
				id
				name
			  }
			  confirmed
			  condition_is_fulfilled
			},
			my_participations: participations(where: {account_id: {_eq: $_user_id}}) {
			  id
			  threshold
			  confirmed
			  condition_is_fulfilled
			}
			campaign_dismissals {
			  account_id
			  account {
				id
				name
			  }
			}
			unconfirmed_fulfilled_count: participations_aggregate(where: {confirmed: {_eq: false}, condition_is_fulfilled: {_eq: true}, account:{smazano:{_eq: false}}}) {
			  aggregate {
				count
			  }
			}
			confirmed_fulfilled_count: participations_aggregate(where: {confirmed: {_eq: true}, condition_is_fulfilled: {_eq: true}, account:{smazano:{_eq: false}}}) {
			  aggregate {
				count
			  }
			}
		}
`;


export function get_status_class(participation)
{
	if (participation.condition_is_fulfilled)
	{
		if (participation.confirmed)
		{
			return "confirmed"
		}
		else
			return "condition_is_fulfilled"
	}
	else
		return "condition_is_not_fulfilled"
}

export function get_tickmark(participation)
{
	if (!participation || participation.threshold === undefined)
		return ""
	else
	{
		if (participation.condition_is_fulfilled)
		{
			if (participation.confirmed)
			{
				return '✅'
			}
			else
				return "✉" // "☑?"
		}
		else
			return "👁"
	}
}

export function short_description(participation)
{
	if (!participation || participation.threshold === undefined)
		return ""
	else
	{
		if (participation.condition_is_fulfilled)
		{
			if (participation.confirmed)
			{
				return 'participation confirmed!'
			}
			else
				return "awaiting confirmation.."
		}
		else
			return "more participants needed..."
	}
}

export function long_description(participation)
{
	if (!participation || participation.threshold === undefined)
		return ""
	else
	{
		if (participation.condition_is_fulfilled)
		{
			if (participation.confirmed)
			{
				return "threshold is reached, participation is confirmed"
			}
			else
				return "threshold is reached, waiting for confirmation"
		}
		else
			return "this user is waiting for more participants..."
	}
}

export function modal_hack(isOpen)
{
	/* https://github.com/bestguy/sveltestrap/issues/248 */
	if (isOpen)
		document.documentElement.style.removeProperty('--saturate');
	else
		document.documentElement.style.setProperty('--saturate', saturate_computate(get(my_user).saturate));
}

export function set_css_var(name, value)
{
	if (!browser) return;
	document.documentElement.style.setProperty(name, value);
}

export function saturate_computate(x)
{
	const color_theme_saturate = x;
	return (100 + (color_theme_saturate || 0)) + "%";
}
