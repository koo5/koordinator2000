/**
 * URQL client configuration for Svelte
 */
import { browser } from '$app/environment';
import { writable, readable } from 'svelte/store';
import { 
  Client, 
  getContextClient, 
  setContextClient, 
  queryStore,
  subscriptionStore 
} from '@urql/svelte';
import { gql } from 'graphql-tag';
import { public_env } from '$lib/public_env.js';
import { 
  cacheExchange, 
  fetchExchange, 
  ssrExchange,
  subscriptionExchange
} from '@urql/core';
import { createClient as createWSClient } from 'graphql-ws';

// Track GraphQL connection status
export const graphqlConnectionStatus = writable({
  connected: true,
  error: false,
  message: 'Initialized'
});

// Setup SSR exchange for server-side rendering
const ssr = ssrExchange({
  isClient: browser
});

// Create WebSocket client for subscriptions
function getWebSocketUrl(endpoint) {
  // Convert HTTP URL to WebSocket URL
  const wsEndpoint = endpoint.replace(/^http/, 'ws');
  return `wss://${wsEndpoint}`;
}

// Export client creation function
export function createUrqlClient() {
  console.log('Creating URQL client with endpoint:', public_env.GRAPHQL_ENDPOINT);
  
  // Create WebSocket client for subscriptions if in browser environment
  const wsClient = browser ? createWSClient({
    url: getWebSocketUrl(public_env.GRAPHQL_ENDPOINT),
    connectionParams: {
      headers: public_env.PUBLIC_GRAPHQL_HEADERS || { 'content-type': 'application/json' }
    }
  }) : null;
  
  return new Client({
    url: `https://${public_env.GRAPHQL_ENDPOINT}`,
    fetchOptions: {
      headers: public_env.PUBLIC_GRAPHQL_HEADERS || { 'content-type': 'application/json' }
    },
    exchanges: [
      cacheExchange,
      ssr, // Add SSR exchange
      fetchExchange,
      // Add subscription exchange only in browser environment
      ...(browser && wsClient ? [
        subscriptionExchange({
          forwardSubscription(operation) {
            return {
              subscribe: (sink) => {
                const dispose = wsClient.subscribe(operation, sink);
                return {
                  unsubscribe: dispose
                };
              }
            };
          }
        })
      ] : [])
    ]
  });
}

// Export context functions
export { setContextClient, getContextClient }

/**
 * Subscribe to a GraphQL query or subscription
 * Automatically detects operation type and uses the appropriate store
 * 
 * NOTE: This function is deprecated; use queryStore or subscriptionStore directly instead
 */
export function subscribe(query, options = {}) {
  // Check operation type from query definition
  const operationType = query.definitions?.[0]?.operation;
  
  // Use appropriate store based on operation type
  const urqlStore = operationType === 'subscription' 
    ? subscriptionStore({
        client: getContextClient(),
        query: query,
        variables: options.variables || {}
      })
    : queryStore({
        client: getContextClient(),
        query: query,
        variables: options.variables || {}
      });
  
  // Transform to our expected format for backwards compatibility
  const store = writable({ loading: true, data: null, error: null });
  
  urqlStore.subscribe(result => {
    store.set({
      loading: result.fetching,
      data: result.data,
      error: result.error
    });
    
    // Update connection status on error
    if (result.error) {
      graphqlConnectionStatus.set({
        connected: false,
        error: true,
        message: result.error.message || 'GraphQL Error'
      });
    }
  });
  
  return {
    subscribe: store.subscribe
  };
}

/**
 * Create a mutation function
 */
export function mutation(query) {
  return async (variables) => {
    if (!browser) {
      console.warn('Mutation attempted on server-side');
      return { data: null };
    }
    
    try {
      const result = await getContextClient().mutation(query, variables || {}).toPromise();
      return result;
    } catch (error) {
      console.error('Mutation error:', error);
      graphqlConnectionStatus.set({
        connected: false,
        error: true,
        message: error.message || 'GraphQL Mutation Error'
      });
      return { data: null, error };
    }
  };
}

// Export URQL functions for direct use
export { gql, queryStore, subscriptionStore };