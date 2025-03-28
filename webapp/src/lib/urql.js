/**
 * URQL client configuration for Svelte
 */
import { browser } from '$app/environment';
import { writable, readable } from 'svelte/store';
import { Client, getContextClient, setContextClient } from '@urql/svelte';
import { gql } from 'graphql-tag';
import { public_env } from '$lib/public_env.js';
import { cacheExchange, fetchExchange, ssrExchange } from '@urql/core';

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

// Export client creation function
export function createUrqlClient() {
  console.log('Creating URQL client with endpoint:', public_env.GRAPHQL_ENDPOINT);
  return new Client({
    url: `https://${public_env.GRAPHQL_ENDPOINT}`,
    fetchOptions: {
      headers: public_env.PUBLIC_GRAPHQL_HEADERS || { 'content-type': 'application/json' }
    },
    exchanges: [
      cacheExchange,
      ssr, // Add SSR exchange
      fetchExchange
    ]
  });
}

// Export context functions
export { setContextClient, getContextClient }

/**
 * Subscribe to a GraphQL query
 */
export function subscribe(query, options = {}) {
  if (!browser) {
    return readable({ loading: true, data: null, error: null });
  }
  
  const result = { 
    loading: true, 
    data: null, 
    error: null 
  };
  
  const store = writable(result);
  
  const queryResult = options.variables ? 
    { query, variables: options.variables } : 
    { query };
    
  // Handle subscription by converting URQL result to match expected format
  const urqlStore = browser ? 
    // If it's a subscription, use it directly
    query.definitions?.[0]?.operation === 'subscription' ?
      getContextClient().subscription(queryResult).toSvelte() :
      getContextClient().query(queryResult).toSvelte() :
    readable({ fetching: false, data: null, error: null });
  
  // Subscribe to URQL store and transform to expected format
  const unsubscribe = urqlStore.subscribe(result => {
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

// Export gql tag for query building
export { gql };