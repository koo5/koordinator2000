import { readable,writable, get } from 'svelte/store';
import {localStorageSharedStore} from './svelte-shared-store';

export const my_user = process.browser ?
	localStorageSharedStore('my_user',{id:-1})
	//writable({id:-1})
	:
	readable({id:0});

export function impersonate(_id)
{
    my_user.set({id:_id} )
}

async function new_user()
{
	console.log('/get_free_user_id');
	try
	{
		var res = await fetch('/get_free_user_id', {method: 'POST'})
		console.log(res);
		var r = await res.json()
		console.log("r:"+JSON.stringify(r, null, '  '));
	}
	catch(e)
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
			mode:"same-origin",
		    body: JSON.stringify({event:event})
  		});
		console.log("res:"+ (typeof res) + ":" + JSON.stringify(res, null, '  '));
		res = await res;
		console.log("res:"+ (typeof res) + ":" + JSON.stringify(res, null, '  '));
		try
		{
			res2 = await res.json()
		}
		catch(ee)
		{
		}
		console.log("res2:" + (typeof res2) + ":" + JSON.stringify(res2, null, '  '));
	}
	catch(e)
	{
		console.error(e);
	}
	return res2
}


export async function ensure_we_exist()
{
	const user = get(my_user);
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

export function logout()
{
	my_user.set({id:-1});
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
			throw('this shouldnt happen: (campaign.my_participations.length > 1)');
		}
	}

