// Common types used throughout the application

// Apollo and GraphQL related types
declare type ApolloResult<T> = {
  data?: T;
  loading: boolean;
  error?: Error;
};

// Authentication related types
declare type Auth0Info = {
  sub: string;
  email?: string;
  [key: string]: any;
};

declare type Auth0Data = {
  token: string;
  info: Auth0Info;
};

declare type AuthEvent = {
  auth: {
    auth0: Auth0Data;
  };
  id?: number;
};

// Event handling
declare type EventHandler = (...args: any[]) => void;

// SvelteKit specific
declare type LoadEvent = {
  params: Record<string, string>;
  data: Record<string, any>;
};

// Svelte store types
declare type Writable<T> = {
  subscribe: (run: (value: T) => void) => () => void;
  set: (value: T) => void;
  update: (updater: (value: T) => T) => void;
};

declare type Readable<T> = {
  subscribe: (run: (value: T) => void) => () => void;
};

// User and account types
declare type UserObject = {
  id: number;
  name?: string;
  email?: string;
  jwt?: string;
  [key: string]: any;
};

// Missing module declarations
declare module 'html-minifier' {
  export function minify(html: string, options?: any): string;
}

declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';
  
  export interface Request extends IncomingMessage {
    url: string;
    path: string;
    query: any;
    params: any;
    body?: any;
    [key: string]: any;
  }
  
  export interface Response extends ServerResponse {
    status(code: number): Response;
    send(body: any): Response;
    json(body: any): Response;
    [key: string]: any;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export interface ExpressModule {
    (): Express;
    json(options?: any): any;
    urlencoded(options?: { extended?: boolean }): any;
    static(path: string): any;
    [key: string]: any;
  }
  
  export interface Express {
    use(...handlers: any[]): Express;
    listen(port: number, callback?: () => void): void;
    [key: string]: any;
  }
  
  const express: ExpressModule;
  export default express;
}

// SvelteKit adapter-node handler
declare module './handler' {
  import type { RequestHandler } from 'express';
  export const handler: RequestHandler;
}

// Other module declarations
declare module 'sanitize-html' {
  interface SanitizeOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    [key: string]: any;
  }
  
  function sanitize(html: string, options?: SanitizeOptions): string;
  export default sanitize;
}

// GraphQL type declarations
declare module 'graphql' {
  export interface DocumentNode {
    kind: string;
    definitions: ReadonlyArray<any>;
    loc?: Location;
  }
  
  export interface OperationDefinitionNode {
    kind: string;
    operation: string;
    name?: { value: string };
    variableDefinitions?: ReadonlyArray<any>;
    directives?: ReadonlyArray<any>;
    selectionSet: any;
    loc?: Location;
  }
  
  export interface Location {
    start: number;
    end: number;
    source?: any;
  }
}

// URQL related types
declare module '@urql/core' {
  import type { DocumentNode } from 'graphql';
  
  export interface GraphQLRequest<Variables = any> {
    query: DocumentNode | string;
    variables?: Variables;
    key?: number;
    [key: string]: any;
  }
  
  export interface SubscribePayload {
    query: string;
    variables?: any;
    operationName?: string;
    [key: string]: any;
  }
  
  export interface Sink {
    next: (value: any) => void;
    complete: () => void;
    error: (error: Error) => void;
  }
  
  export type SubscriptionForwarder = (request: GraphQLRequest<any>, sink: Sink) => { unsubscribe: () => void };
  
  // Core exports
  export const cacheExchange: any;
  export const fetchExchange: any;
  export const ssrExchange: (options?: any) => any;
  export const subscriptionExchange: (options: any) => any;
  export type Exchange = any;
  export type OperationResult<Data = any, Variables = any> = any;
  
  export interface OperationResultState<Data = any, Variables = any> {
    fetching: boolean;
    data?: Data;
    error?: Error;
    [key: string]: any;
  }
  
  export interface Client {
    query<Data = any, Variables = any>(query: any, variables?: Variables): any;
    mutation<Data = any, Variables = any>(query: any, variables?: Variables): any;
    subscription<Data = any, Variables = any>(query: any, variables?: Variables): any;
    [key: string]: any;
  }
  
  export function createClient(options: any): Client;
}

declare module '@urql/svelte' {
  import type { Readable } from 'svelte/store';
  import type { Client, OperationResultState } from '@urql/core';
  
  export const getContextClient: () => Client;
  export const setContextClient: (client: Client) => void;
  export function queryStore<Data = any, Variables = any>(options: any): Readable<OperationResultState<Data, Variables>>;
  export function subscriptionStore<Data = any, Variables = any>(options: any): Readable<OperationResultState<Data, Variables>>;
  export type OperationContext = any;
  export type Client = import('@urql/core').Client;
}

// Legacy nhost.js module that needs to be migrated
declare module '../../utils/nhost.js' {
  export const auth: {
    confirmPasswordChange: (password: string, ticket: string) => Promise<any>;
    [key: string]: any;
  };
}

// graphql-ws WebSocket client
declare module 'graphql-ws' {
  export interface Client {
    subscribe(payload: any, sink: any): () => void;
  }

  export function createClient(options: {
    url: string;
    connectionParams?: Record<string, any>;
    [key: string]: any;
  }): Client;
}