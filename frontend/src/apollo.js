import {get} from 'svelte/store';
import ApolloClient from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {WebSocketLink} from "apollo-link-ws";
import {split} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {getMainDefinition} from "apollo-utilities";
// Use global fetch instead of node-fetch
import gql from 'graphql-tag';
import {readable} from 'svelte/store';
import {subscribe as apollo_subscribe} from 'svelte-apollo';
import {mutation} from 'svelte-apollo';
import {onMount, getContext} from 'svelte';
import {my_user} from './my_user';
import * as config_file from './config.js';
import { browser } from '$app/environment';

function config()
{
	if (browser)
	{
		// We're in the browser
		try {
			const session = getContext('sveltekit:app')?.session;
			return session || config_file.config;
		} catch (e) {
			console.error('Error getting session from context:', e);
			return config_file.config;
		}
	}
	console.log('Not in browser');
	return config_file.config;
}


/*
export async function mutate(query, vars, status)
{
	try
	{
		ensure_we_exist();
		await mutation(query)({variables: variables});
		status.set('ok');

	} catch (e)
	{
		status.set(e)
	}
}
*/

function subscribe(query, options)
{
//	console.log([query,options]);
	var result;
	if (browser)
		result = apollo_subscribe(query, options)
	else
		result = readable({loading: true});
//	console.log(['subscribe result:',result]);
	return result;
}


function new_apollo_client()
{
	//console.log(config());

	const headers = {
		'content-type': 'application/json',
		...(config().PUBLIC_GRAPHQL_HEADERS || {})
		//role: 'public'
	};

	const getHeaders = () =>
	{
		return headers;
	};

	const cache = new InMemoryCache();

	const wsLink = browser ? new WebSocketLink({
		uri: "wss://" + config().GRAPHQL_ENDPOINT,
		options: {
			reconnect: true,
			lazy: true,
			connectionParams: () =>
			{
				return {headers: getHeaders()};
			},
		},
	}) : null;

	const httpLink = new HttpLink({
		uri: "https://" + config().GRAPHQL_ENDPOINT,
		headers: getHeaders(),
		// No need to specify fetch - the library will use the global fetch API
		// which is available in both browser and Node.js environments
	});

	const link = browser ? split(
		({query}) =>
		{
			const {kind, operation} = getMainDefinition(query);
			return kind === "OperationDefinition" && (operation === "subscription" || operation === "mutation");
		},
		wsLink,
		httpLink
	) : httpLink;

	return new ApolloClient({
		ssrMode: true,
		link,
		cache
	});
}


export {subscribe, gql, new_apollo_client};



