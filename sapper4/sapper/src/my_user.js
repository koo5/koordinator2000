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
	console.log('/event');
	console.log(event);
	try
	{
		let res = await fetch('/event', {
			method: 'POST',
			headers: {
    		  'Content-Type': 'application/json'
		    },
		    body: JSON.stringify({event:event})
  		});
		res = await res.json();
		console.log("r:"+JSON.stringify(res, null, '  '));
	}
	catch(e)
	{
		console.error(e);
	}
	return res
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
