/**
 * Shared Apollo client configuration used by both client and server
 */
import ApolloClient from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {WebSocketLink} from "apollo-link-ws";
import {split} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {getMainDefinition} from "apollo-utilities";
import gql from 'graphql-tag';
import {readable} from 'svelte/store';
// Import from compat wrapper instead of directly from svelte-apollo
import {subscribe as apollo_subscribe, mutation} from './apollo-compat-wrapper.svelte';
import { public_env } from '$lib/public_env.js';
import { browser } from '$app/environment';

// Track GraphQL connection status
export let graphqlConnectionError = false;

/**
 * Subscribe to a GraphQL query
 */
function subscribe(query, options) {
  var result;
  if (browser) {
    // Use query from the wrapper instead
    result = apollo_subscribe(query, options);
  } else {
    result = readable({loading: true});
  }
  return result;
}

/**
 * Create a new Apollo client for client-side use
 */
function new_apollo_client() {
  // Use headers from environment configuration
  const headers = public_env.PUBLIC_GRAPHQL_HEADERS || {
    'content-type': 'application/json'
  };
  
  // Debug headers (without sensitive info)
  console.log('Client GraphQL headers keys:', Object.keys(headers));

  const getHeaders = () => {
    return headers;
  };

  const cache = new InMemoryCache();

  // Print the actual endpoint being used
  console.log("Client GraphQL Endpoint:", public_env.GRAPHQL_ENDPOINT);
  
  // Create WebSocket link with error handling
  const wsLink = browser ? new WebSocketLink({
    uri: "wss://" + public_env.GRAPHQL_ENDPOINT,
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
    uri: "https://" + public_env.GRAPHQL_ENDPOINT,
    headers: getHeaders(),
    // No need to specify fetch - the library will use the global fetch API
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
    ssrMode: !browser,
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
