/**
 * Server-side Apollo client configuration
 * This file should only be imported by server-side code
 */
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from 'graphql-tag';
import { server_env } from '$lib/server/env.js';

// Create a server-side Apollo client with admin privileges
function create_server_apollo_client() {
  console.log('Creating server-side Apollo client');
  
  // Use headers from server environment
  const headers = server_env.PUBLIC_GRAPHQL_HEADERS;
  
  // Debug headers (without showing admin secret)
  console.log('Server GraphQL headers keys:', Object.keys(headers));
  
  const cache = new InMemoryCache();
  
  // Print the actual endpoint being used
  console.log("Server GraphQL Endpoint:", server_env.GRAPHQL_ENDPOINT);
  
  // Create HTTP link for server
  const httpLink = new HttpLink({
    uri: "https://" + server_env.GRAPHQL_ENDPOINT,
    headers,
    // No need to specify fetch - the library will use the global fetch API
  });
  
  return new ApolloClient({
    ssrMode: true,
    link: httpLink,
    cache,
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      },
      mutate: {
        errorPolicy: 'all'
      }
    }
  });
}

// Lazy-loaded Apollo client instance
let _server_apollo_client;
export function get_server_apollo_client() {
  if (!_server_apollo_client) {
    _server_apollo_client = create_server_apollo_client();
  }
  return _server_apollo_client;
}

export { gql };
