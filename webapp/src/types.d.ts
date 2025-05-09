// Common types used throughout the application

// Global window object extensions for third-party libraries
interface Window {
    // Firepad library
    Firepad?: {
        fromCodeMirror: (
            ref: any,
            codeMirror: any,
            options: any
        ) => {
            on: (event: string, callback: () => void) => void;
            isHistoryEmpty: () => boolean;
            setHtml: (html: string) => void;
            registerEntity: (name: string, entity: any) => void;
            dispose: () => void;
        };
    };

    // CodeMirror library
    CodeMirror?: (element: HTMLElement, options: any) => any;

    // Remarkable library
    remarkable?: {
        Remarkable: new () => {
            render: (markdown: string) => string;
        };
    };
}

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

// svelte-scrollto module
declare module 'svelte-scrollto' {
    export function scrollTo(options: any): void;

    export function scrollToTop(options?: any): void;

    export function scrollToBottom(options?: any): void;

    export function scrollToElement(element: HTMLElement, options?: any): void;
}

// graphql-ws WebSocket client
declare module 'graphql-ws' {
    export interface Client {
        subscribe(payload: any, sink: any): () => void;
    }

    export function createClient(options: { url: string; connectionParams?: Record<string, any>; [key: string]: any }): Client;
}

// Keyv module
declare module 'keyv' {
    export interface KeyvOptions {
        uri?: string;
        store?: any;
        adapter?: string;
        ttl?: number;
        namespace?: string;

        [key: string]: any;
    }

    class Keyv {
        constructor(options?: KeyvOptions | string);

        get(key: string): Promise<any>;

        set(key: string, value: any, ttl?: number): Promise<boolean>;

        delete(key: string): Promise<boolean>;

        clear(): Promise<void>;
    }

    export default Keyv;
}
