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


// Track GraphQL connection status
export let graphqlConnectionError = false;

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

	// Create WebSocket link with error handling
	const wsLink = browser ? new WebSocketLink({
		uri: "wss://" + config().GRAPHQL_ENDPOINT,
		options: {
			reconnect: true,
			lazy: true,
			connectionParams: () => {
				return {headers: getHeaders()};
			},
			// Add connection event handlers
			connectionCallback: (err) => {
				if (err) {
					console.error("WebSocket connection error:", err);
					graphqlConnectionError = true;
				} else {
					console.log("WebSocket connected successfully");
					graphqlConnectionError = false;
				}
			}
		},
	}) : null;

	// Create HTTP link with error handling
	const httpLink = new HttpLink({
		uri: "https://" + config().GRAPHQL_ENDPOINT,
		headers: getHeaders(),
		// No need to specify fetch - the library will use the global fetch API
		// which is available in both browser and Node.js environments
	});

	// Simple error handler function 
	const handleErrors = ({ networkError, graphQLErrors }) => {
		if (networkError) {
			console.error(`[Network error]: ${networkError}`);
			graphqlConnectionError = true;
		}
		
		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, locations, path }) => {
				console.error(
					`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				);
			});
			// Only mark as connection error if it's a connection-related issue
			if (graphQLErrors.some(err => 
				err.message.includes('connect') || 
				err.message.includes('network') ||
				err.message.includes('timeout'))) {
				graphqlConnectionError = true;
			}
		}
	};

	// Create a custom error-handling link
	const errorLink = {
		request: (operation, forward) => {
			return forward(operation).map(result => {
				if (result.errors) {
					handleErrors({ graphQLErrors: result.errors });
				}
				return result;
			});
		}
	};

	// Create combined link with error handling
	const link = browser ? 
		split(
			({query}) => {
				const {kind, operation} = getMainDefinition(query);
				return kind === "OperationDefinition" && (operation === "subscription" || operation === "mutation");
			},
			wsLink,
			httpLink
		) : httpLink;

	const client = new ApolloClient({
		ssrMode: true,
		link,
		cache,
		// Add error handling for fetch policy
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'network-only',
				errorPolicy: 'all',
				onError: (error) => {
					console.error('Watch query error:', error);
					if (error.networkError) {
						graphqlConnectionError = true;
					}
				}
			},
			query: {
				fetchPolicy: 'network-only',
				errorPolicy: 'all',
				onError: (error) => {
					console.error('Query error:', error);
					if (error.networkError) {
						graphqlConnectionError = true;
					}
				}
			},
			mutate: {
				errorPolicy: 'all',
				onError: (error) => {
					console.error('Mutation error:', error);
					if (error.networkError) {
						graphqlConnectionError = true;
					}
				}
			}
		}
	});
	
	// Set up a network status listener
	client.onNetworkStatusChange = (status) => {
		if (status === 8) { // 8 = error
			graphqlConnectionError = true;
		} else if (status === 7) { // 7 = ready/success
			graphqlConnectionError = false;
		}
	};
	
	return client;
}


export {subscribe, gql, new_apollo_client};



