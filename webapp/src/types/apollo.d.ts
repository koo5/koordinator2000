/**
 * Type definitions for Apollo GraphQL operations
 */
import type { DocumentNode } from 'graphql';
import type { Readable } from 'svelte/store';

// Apollo client types
export interface ApolloClientOptions {
  uri: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  credentials?: string;
  onError?: (error: Error) => void;
  connectToDevTools?: boolean;
}

// GraphQL subscription types
export interface SubscriptionOptions<T = any> {
  variables?: T;
  fetchPolicy?: 'cache-first' | 'network-only' | 'cache-only' | 'no-cache' | 'standby';
  errorPolicy?: 'none' | 'ignore' | 'all';
  pollInterval?: number;
}

export interface QueryResult<T = any> {
  data?: T;
  loading: boolean;
  error?: Error;
  networkStatus?: number;
  stale?: boolean;
  client?: any;
}

export interface SubscriptionResult<T = any> extends QueryResult<T> {
  // Additional subscription-specific properties could be added here
}

// Svelte-Apollo types
export interface ReadableQuery<T = any, V = any> extends Readable<QueryResult<T>> {
  refetch: (variables?: V) => Promise<{ data: T }>;
  fetchMore: (options: { variables?: V; updateQuery?: (prev: T, options: { fetchMoreResult: T }) => T }) => Promise<any>;
  networkStatus: number;
  startPolling: (interval: number) => void;
  stopPolling: () => void;
}

// Declare module augmentation for $lib/apollo.js
declare module '$lib/apollo.js' {
  export function query<T = any, V = any>(
    query: DocumentNode,
    options?: Omit<SubscriptionOptions<V>, 'query'>
  ): ReadableQuery<T, V>;
  
  export function mutate<T = any, V = any>(
    mutation: DocumentNode,
    options?: {
      variables?: V;
      refetchQueries?: Array<{ query: DocumentNode; variables?: any }>;
      optimisticResponse?: T;
      update?: (cache: any, result: { data: T }) => void;
    }
  ): Promise<{ data: T }>;
  
  export function subscribe<T = any, V = any>(
    query: DocumentNode,
    options?: SubscriptionOptions<V>
  ): Readable<SubscriptionResult<T>>;
  
  export const gql: (strings: TemplateStringsArray, ...values: any[]) => DocumentNode;
  
  export const client: any;
}

// Declare types for graphql-tag
declare module 'graphql-tag' {
  export default function gql(strings: TemplateStringsArray, ...values: any[]): DocumentNode;
  export function resetCaches(): void;
  export function disableFragmentWarnings(): void;
}