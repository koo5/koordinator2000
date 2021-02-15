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
