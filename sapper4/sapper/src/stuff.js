import {gql} from "srcs/apollo.js";
import sanitizeHtml from 'sanitize-html';

export function sanitize_html(x)
{
//	return sanitizeHtml(x);
	return x;
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

