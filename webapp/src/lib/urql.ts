/**
 * URQL client configuration for Svelte
 */
import { browser } from '$app/environment';
import { type Readable, type Writable, writable, get } from 'svelte/store'; // Import get
import { getContextClient, queryStore, setContextClient, subscriptionStore } from '@urql/svelte';
// Import GraphQL types properly from CommonJS module
import type { DocumentNode, OperationDefinitionNode } from 'graphql';
import { gql } from 'graphql-tag';
import { public_env } from '$lib/public_env';
import { my_user } from '$lib/client/my_user'; // Import my_user store
import { cacheExchange, type Client, createClient, type Exchange, fetchExchange, ssrExchange, subscriptionExchange } from '@urql/core';
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
    fetching: boolean;
    data: T | null;
    error: Error | null;
}

/**
 * Operation context interface
 */
interface OperationContext {
    [key: string]: any;
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
    message: 'Initialized',
});

// Setup SSR exchange for server-side rendering
const ssr = ssrExchange({
    isClient: browser,
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

    // Function to dynamically get fetch options (including auth header)
    const getFetchOptions = (): RequestInit => {
        const headers: Record<string, string> = {
            'content-type': 'application/json', // Keep default content type
            ...public_env.PUBLIC_GRAPHQL_HEADERS, // Include other static headers
        };
        const user = get(my_user); // Get current user state
        if (user && user.jwt) {
            headers['Authorization'] = `Bearer ${user.jwt}`; // Add auth header if token exists
            console.log('URQL Client: Added Authorization header'); // Added log
        } else {
            console.log('URQL Client: No JWT found, skipping Authorization header'); // Added log
        }
        return { headers };
    };

    // Create WebSocket client for subscriptions if in browser environment
    const wsClient = browser
        ? createWSClient({
              url: getWebSocketUrl(public_env.GRAPHQL_ENDPOINT), // Use helper function
              connectionParams: () => { // Use function for dynamic params
                  const user = get(my_user);
                  const headers = {
                      ...(public_env.PUBLIC_GRAPHQL_HEADERS || {}),
                      ...(user?.jwt ? { Authorization: `Bearer ${user.jwt}` } : {}),
                  };
                  console.log('WS Client: Connection params headers:', headers); // Added log
                  return { headers };
              },
          })
        : null;

    const exchanges: Exchange[] = [
        cacheExchange,
        ssr, // Add SSR exchange
        fetchExchange,
    ];

    // Add subscription exchange only in browser environment
    if (browser && wsClient) {
        exchanges.push(
            subscriptionExchange({
                forwardSubscription: (operation: any) => {
                    const opWithKey = { ...operation, key: 1 };
                    return {
                        subscribe: (sink: any) => {
                            // Convert the DocumentNode to a string if needed
                            if (typeof opWithKey.query !== 'string') {
                                const stringifiedQuery = JSON.stringify(opWithKey.query);
                                const payload = { ...opWithKey, query: stringifiedQuery };
                                const dispose = wsClient.subscribe(payload, sink);
                                return {
                                    unsubscribe: dispose,
                                };
                            } else {
                                const dispose = wsClient.subscribe(opWithKey, sink);
                                return {
                                    unsubscribe: dispose,
                                };
                            }
                        },
                    };
                },
            })
        );
    }

    return createClient({
        url: `https://${public_env.GRAPHQL_ENDPOINT}`, // Ensure HTTPS
        fetchOptions: getFetchOptions, // Use the dynamic fetchOptions function
        exchanges,
    });
}

/**
 * Create a new URQL client with specific role
 * @param role - Hasura role to use
 * @returns New URQL client with role header
 */
export function createRoleClient(role: string): Client {
    // Function to get fetch options with role
    const getRoleFetchOptions = (): RequestInit => {
        const headers: Record<string, string> = {
            'content-type': 'application/json',
            ...public_env.PUBLIC_GRAPHQL_HEADERS,
            'x-hasura-role': role // Add role header
        };
        
        const user = get(my_user);
        if (user && user.jwt) {
            headers['Authorization'] = `Bearer ${user.jwt}`;
        }
        
        return { headers };
    };
    
    // Create a new client with role header
    return createClient({
        url: `https://${public_env.GRAPHQL_ENDPOINT}`,
        fetchOptions: getRoleFetchOptions,
        exchanges: [cacheExchange, ssr, fetchExchange]
    });
}

/**
 * Get client with 'user' role
 * @returns URQL client configured with 'user' role
 */
export function getUserRoleClient(): Client {
    return createRoleClient('user');
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
export function subscribe<T = any>(query: any, options: SubscribeOptions = {}, useUserRole = false): Readable<QueryResult<T>> {
    // Check operation type from query definition
    const definition = (query as DocumentNode).definitions?.[0] as OperationDefinitionNode;
    const operationType = definition?.operation;
    
    // Get appropriate client based on role
    const client = useUserRole ? getUserRoleClient() : getContextClient();

    // Use appropriate store based on operation type
    const urqlStore =
        operationType === 'subscription'
            ? subscriptionStore({
                  client: client,
                  query: query,
                  variables: options.variables || {},
              })
            : queryStore({
                  client: client,
                  query: query,
                  variables: options.variables || {},
              });

    // Transform to our expected format for backwards compatibility
    const store: Writable<QueryResult<T>> = writable({ fetching: true, data: null, error: null });

    urqlStore.subscribe(result => {
        store.set({
            fetching: result.fetching,
            data: result.data as T | null,
            error: result.error || null,
        });

        // Update connection status on error
        if (result.error) {
            graphqlConnectionStatus.set({
                connected: false,
                error: true,
                message: result.error.message || 'GraphQL Error',
            });
        }
    });

    return {
        subscribe: store.subscribe,
    };
}

/**
 * Create a mutation function
 * @param query - GraphQL mutation
 * @returns Function to execute the mutation
 */
export function mutation<TData = any, TVariables extends Record<string, any> = Record<string, any>>(query: any, useUserRole = false): (variables?: TVariables) => Promise<MutationResult<TData>> {
    return async (variables?: TVariables): Promise<MutationResult<TData>> => {
        if (!browser) {
            console.warn('Mutation attempted on server-side');
            return { data: null };
        }

        try {
            // Get appropriate client based on role
            const client = useUserRole ? getUserRoleClient() : getContextClient();
            
            const result = await client
                .mutation<TData, TVariables>(query, variables || ({} as TVariables))
                .toPromise();

            return {
                data: result.data ?? null,
                error: result.error || undefined,
            };
        } catch (error) {
            console.error('Mutation error:', error);
            graphqlConnectionStatus.set({
                connected: false,
                error: true,
                message: (error as Error).message || 'GraphQL Mutation Error',
            });
            return { data: null, error: error as Error };
        }
    };
}

/**
 * Create a subscription store with specified role
 * @param options - Subscription options
 * @param useUserRole - Whether to use the 'user' role
 * @returns Subscription store
 */
export function subscriptionStoreWithRole<T = any, V = object>(options: any, useUserRole = false) {
    const client = useUserRole ? getUserRoleClient() : getContextClient();
    return subscriptionStore<T, V>({
        ...options,
        client
    });
}

/**
 * Create a query store with specified role
 * @param options - Query options
 * @param useUserRole - Whether to use the 'user' role
 * @returns Query store
 */
export function queryStoreWithRole<T = any, V = object>(options: any, useUserRole = false) {
    const client = useUserRole ? getUserRoleClient() : getContextClient();
    return queryStore<T, V>({
        ...options,
        client
    });
}

/**
 * Shorthand to create a query store with 'user' role
 */
export function queryStoreAsUser<T = any, V = object>(options: any) {
    return queryStoreWithRole<T, V>(options, true);
}

/**
 * Shorthand to create a subscription store with 'user' role
 */
export function subscriptionStoreAsUser<T = any, V = object>(options: any) {
    return subscriptionStoreWithRole<T, V>(options, true);
}

// Export URQL functions for direct use
export { gql, queryStore, subscriptionStore };
