/**
 * Server-side URQL client configuration
 * This file should only be imported by server-side code
 */
import { 
  createClient, 
  type Client, 
  type OperationResult
} from '@urql/core';
import { 
  cacheExchange, 
  fetchExchange, 
  ssrExchange
} from '@urql/core';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { server_env } from '$lib/server/env';

/**
 * Query result interface
 */
interface QueryResult<T = any> {
  data: T | null;
  error?: Error;
}

/**
 * Create a server-side URQL client with admin privileges
 * @returns URQL client configured for server-side use
 */
function createServerClient(): Client {
  console.log('Creating server-side URQL client');
  
  // Use headers from server environment
  const headers = server_env.PUBLIC_GRAPHQL_HEADERS;
  
  // Debug headers (without showing admin secret)
  console.log('Server GraphQL headers keys:', Object.keys(headers));
  
  // Print the actual endpoint being used
  console.log("Server GraphQL Endpoint:", server_env.GRAPHQL_ENDPOINT);
  
  // Create SSR exchange for server
  const ssr = ssrExchange({ isClient: false });
  
  return createClient({
    url: `https://${server_env.GRAPHQL_ENDPOINT}`,
    fetchOptions: {
      headers
    },
    // Use only necessary exchanges for server-side
    exchanges: [
      cacheExchange,
      ssr,
      fetchExchange
    ]
  });
}

// Lazy-loaded URQL client instance
let serverClient: Client | undefined;

/**
 * Get or create the server client
 * @returns Server-side URQL client
 */
export function getServerClient(): Client {
  if (!serverClient) {
    serverClient = createServerClient();
  }
  return serverClient;
}

/**
 * Server-side query function
 * @param queryDocument - GraphQL query document
 * @param variables - Query variables
 * @returns Query result
 */
export async function serverQuery<TData = any, TVariables extends Record<string, any> = Record<string, any>>(
  queryDocument: DocumentNode, 
  variables: TVariables = {} as TVariables
): Promise<OperationResult<TData>> {
  try {
    const client = getServerClient();
    const result = await client.query<TData, TVariables>(
      queryDocument, 
      variables
    ).toPromise();
    return result;
  } catch (error) {
    console.error('Server-side query error:', error);
    return { data: null, error: error as Error } as OperationResult<TData>;
  }
}

/**
 * Server-side mutation function
 * @param mutationDocument - GraphQL mutation document
 * @param variables - Mutation variables
 * @returns Mutation result
 */
export async function serverMutation<TData = any, TVariables extends Record<string, any> = Record<string, any>>(
  mutationDocument: DocumentNode, 
  variables: TVariables = {} as TVariables
): Promise<OperationResult<TData>> {
  try {
    const client = getServerClient();
    const result = await client.mutation<TData, TVariables>(
      mutationDocument, 
      variables
    ).toPromise();
    return result;
  } catch (error) {
    console.error('Server-side mutation error:', error);
    return { data: null, error: error as Error } as OperationResult<TData>;
  }
}

export { gql };