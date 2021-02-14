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
		if (participation.condition_is_fulfilled)
		{
			if (participation.confirmed)
			{
				return '✔'
			}
			else
				return "👍"
		}
		else
			return "🖐"
	}
