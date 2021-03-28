import {readable, writable, get} from 'svelte/store';
import {localStorageSharedStore} from './svelte-shared-store';
import {goto} from '@sapper/app';
import {logout as auth0_logout} from '@dopry/svelte-auth0';
import {EventDispatcher} from 'srcs/event_dispatcher.js';

export const my_user = process.browser ?
	localStorageSharedStore('my_user', {id: -1, auth_debug: false})
	//writable({id:-1})
	:
	readable({id: 0});

export function impersonate(_id)
{
	my_user.set({id: _id})
}

async function new_user()
{
	//console.log('/get_free_user_id');
	try
	{
		var res = await fetch('/get_free_user_id', {method: 'POST'})
		//console.log(res);
		var r = await res.json()
		//console.log("r:" + JSON.stringify(r, null, '  '));
	} catch (e)
	{
		console.error(e);
	}
	return r
}

export async function event(event)
{
	//console.log('/event');
	//console.log(event);
	let res;
	let res2;
	try
	{
		res = fetch('/event', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			mode: "same-origin",
			body: JSON.stringify({event: event})
		});
		//console.log("res:" + (typeof res) + ":" + JSON.stringify(res, null, '  '));
		res = await res;
		//console.log("res:" + (typeof res) + ":" + JSON.stringify(res, null, '  '));
		try
		{
			res2 = await res.json()
		} catch (ee)
		{
		}
		//console.log("res2:" + (typeof res2) + ":" + JSON.stringify(res2, null, '  '));
	} catch (e)
	{
		console.error(e);
	}
	return res2
}


export async function ensure_we_exist()
{
	const user = get(my_user);
	if (my_user.auth_debug)
		console.log('i am ' + JSON.stringify(user, null, '  '));
	if (user.id < 1)
	{
		return await new_user();
	}
	else
		return null;
}

export async function apply_newly_authenticated_user(newly_authenticated_user)
{
	my_user.set(newly_authenticated_user);
}

export async function logout()
{
	my_user.set({id: -1});
	await auth0_logout();
}


export function get_my_participation(campaign, my_user)
{
	if (!campaign)
		return {}
	if (!campaign.my_participations)
		return {}
	if (campaign.my_participations.length == 1)
	{
		let p = campaign.my_participations[0]
		return p
	}
	else if (campaign.my_participations.length == 0)
		return {}
	else
	{
		console.log(campaign.my_participations)
		alert('database error, this shouldnt happen: (campaign.my_participations.length > 1)');
	}
}

export async function register()
{
	try
	{
		await apply_newly_authenticated_user(await ensure_we_exist());
		goto('/you');
	} catch (e)
	{
		console.log(e)
	}
}

export function default_participations_display_style(my_user)
{
	if (my_user.default_participations_display_style)
		return my_user.default_participations_display_style;
	return "tabular_breakdown";
}



export const nag = new EventDispatcher();
let nag_timeout = undefined;

export function decrease_auth_nag_postponement()
{
	console.log('decrease_auth_nag_postponement');
	$my_user.nag_postponement = ($my_user.nag_postponement || 0) - 1;
	if ($my_user.nag_postponement <= 0)
	{
		if (nag_timeout) clearTimeout(nag_timeout);
		nag_timeout = setTimeout(() =>
		{
			nag_timeout = undefined;
			nag.trigger();
		}, 1000);
	}
}

