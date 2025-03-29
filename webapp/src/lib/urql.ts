/**
 * URQL client configuration for Svelte
 */
import { browser } from '$app/environment';
import { writable, readable, type Writable, type Readable } from 'svelte/store';
import { 
  Client, 
  getContextClient, 
  setContextClient, 
  queryStore,
  subscriptionStore, 
  type OperationContext
} from '@urql/svelte';
import { 
  DocumentNode, 
  OperationDefinitionNode 
} from 'graphql';
import { gql } from 'graphql-tag';
import { public_env } from '$lib/public_env';
import { 
  cacheExchange, 
  fetchExchange, 
  ssrExchange,
  subscriptionExchange,
  type Exchange,
  type OperationResult,
  type GraphQLRequest
} from '@urql/core';
import { createClient as createWSClient } from 'graphql-ws';

/**
 * GraphQL connection status interface
 */
interface ConnectionStatus {
  connected: boolean;
  error: boolean;
  message: string;
}

/**
 * Query result interface
 */
interface QueryResult<T = any> {
  loading: boolean;
  data: T | null;
  error: Error | null;
}

/**
 * Subscription options interface
 */
interface SubscribeOptions {
  variables?: Record<string, any>;
  context?: OperationContext;
}

/**
 * Mutation result interface
 */
interface MutationResult<T = any> {
  data: T | null;
  error?: Error;
}

/**
 * WebSocket sink interface
 */
interface Sink {
  next: (value: any) => void;
  complete: () => void;
  error: (error: Error) => void;
}

// Track GraphQL connection status
export const graphqlConnectionStatus: Writable<ConnectionStatus> = writable({
  connected: true,
  error: false,
  message: 'Initialized'
});

// Setup SSR exchange for server-side rendering
const ssr = ssrExchange({
  isClient: browser
});

/**
 * Create WebSocket client for subscriptions
 * @param endpoint - GraphQL endpoint
 * @returns WebSocket URL
 */
function getWebSocketUrl(endpoint: string): string {
  // Convert HTTP URL to WebSocket URL
  const wsEndpoint = endpoint.replace(/^http/, 'ws');
  return `wss://${wsEndpoint}`;
}

/**
 * Export client creation function
 * @returns URQL Client
 */
export function createUrqlClient(): Client {
  console.log('Creating URQL client with endpoint:', public_env.GRAPHQL_ENDPOINT);
  
  // Create WebSocket client for subscriptions if in browser environment
  const wsClient = browser ? createWSClient({
    url: getWebSocketUrl(public_env.GRAPHQL_ENDPOINT),
    connectionParams: {
      headers: public_env.PUBLIC_GRAPHQL_HEADERS || { 'content-type': 'application/json' }
    }
  }) : null;
  
  const exchanges: Exchange[] = [
    cacheExchange,
    ssr, // Add SSR exchange
    fetchExchange
  ];
  
  // Add subscription exchange only in browser environment
  if (browser && wsClient) {
    exchanges.push(
      subscriptionExchange({
        forwardSubscription: (operation: GraphQLRequest) => {
          return {
            subscribe: (sink: Sink) => {
              const dispose = wsClient.subscribe(operation, sink);
              return {
                unsubscribe: dispose
              };
            }
          };
        }
      })
    );
  }
  
  return new Client({
    url: `https://${public_env.GRAPHQL_ENDPOINT}`,
    fetchOptions: {
      headers: public_env.PUBLIC_GRAPHQL_HEADERS || { 'content-type': 'application/json' }
    },
    exchanges
  });
}

// Export context functions
export { setContextClient, getContextClient };

/**
 * Subscribe to a GraphQL query or subscription
 * Automatically detects operation type and uses the appropriate store
 * 
 * NOTE: This function is deprecated; use queryStore or subscriptionStore directly instead
 * @param query - GraphQL query or subscription
 * @param options - Query options
 * @returns Readable store with query results
 */
export function subscribe<T = any>(
  query: DocumentNode, 
  options: SubscribeOptions = {}
): Readable<QueryResult<T>> {
  // Check operation type from query definition
  const definition = query.definitions?.[0] as OperationDefinitionNode;
  const operationType = definition?.operation;
  
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
  const store: Writable<QueryResult<T>> = writable({ loading: true, data: null, error: null });
  
  urqlStore.subscribe(result => {
    store.set({
      loading: result.fetching,
      data: result.data as T | null,
      error: result.error || null
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
 * @param query - GraphQL mutation
 * @returns Function to execute the mutation
 */
export function mutation<TData = any, TVariables = any>(
  query: DocumentNode
): (variables?: TVariables) => Promise<MutationResult<TData>> {
  return async (variables?: TVariables): Promise<MutationResult<TData>> => {
    if (!browser) {
      console.warn('Mutation attempted on server-side');
      return { data: null };
    }
    
    try {
      const result = await getContextClient()
        .mutation<TData, TVariables>(query, variables || {} as TVariables)
        .toPromise();
      
      return {
        data: result.data,
        error: result.error || undefined
      };
    } catch (error) {
      console.error('Mutation error:', error);
      graphqlConnectionStatus.set({
        connected: false,
        error: true,
        message: (error as Error).message || 'GraphQL Mutation Error'
      });
      return { data: null, error: error as Error };
    }
  };
}

// Export URQL functions for direct use
export { gql, queryStore, subscriptionStore };