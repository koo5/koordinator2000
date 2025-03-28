/**
 * Server-side URQL client configuration
 * This file should only be imported by server-side code
 */
import { createClient } from '@urql/core';
import { cacheExchange, fetchExchange, ssrExchange } from '@urql/core';
import { gql } from 'graphql-tag';
import { server_env } from '$lib/server/env.js';

// Create a server-side URQL client with admin privileges
function createServerClient() {
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
let serverClient;

export function getServerClient() {
  if (!serverClient) {
    serverClient = createServerClient();
  }
  return serverClient;
}

/**
 * Server-side query function
 */
export async function serverQuery(queryDocument, variables = {}) {
  try {
    const client = getServerClient();
    const result = await client.query(queryDocument, variables).toPromise();
    return result;
  } catch (error) {
    console.error('Server-side query error:', error);
    return { data: null, error };
  }
}

/**
 * Server-side mutation function
 */
export async function serverMutation(mutationDocument, variables = {}) {
  try {
    const client = getServerClient();
    const result = await client.mutation(mutationDocument, variables).toPromise();
    return result;
  } catch (error) {
    console.error('Server-side mutation error:', error);
    return { data: null, error };
  }
}

export { gql };