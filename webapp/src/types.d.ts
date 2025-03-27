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