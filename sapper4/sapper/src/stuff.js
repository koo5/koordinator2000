import {gql} from "srcs/apollo.js";

export const CAMPAIGN_FRAGMENT = `
		{
			id,
			title,
			stealth,
			description,
			suggested_lowest_threshold,
			suggested_highest_threshold,
			suggested_optimal_threshold,
			participations(order_by: [{threshold: asc}]) {
			  id
			  threshold
			  user {
				id
				name
			  }
			  confirmed
			  condition_is_fulfilled
			},
			my_participations: participations(where: {user_id: {_eq: $_user_id}}) {
			  id
			  threshold
			  confirmed
			  condition_is_fulfilled
			}
			campaign_dismissals {
			  user_id
			  user {
				id
				name
			  }
			}
			unconfirmed_fulfilled_count: participations_aggregate(where: {confirmed: {_eq: false}, condition_is_fulfilled: {_eq: true}}) {
			  aggregate {
				count
			  }
			}
			confirmed_fulfilled_count: participations_aggregate(where: {confirmed: {_eq: true}, condition_is_fulfilled: {_eq: true}}) {
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
				return 'confirmed'
			}
			else
				return "fulfilled"
		}
		else
			return "waiting"
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
				return 'this user is participating (confirmed)'
			}
			else
				return 'this user is participating (waiting for confirmation)'
		}
		else
			return "this user is waiting for more users to participate"
	}
}

