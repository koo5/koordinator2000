/**
 * Type definitions for environment variables
 */

// Static private environment variables
declare module '$env/static/private' {
  export const HASURA_ADMIN_SECRET: string;
  export const MY_APP_KEYS: string;
  export const AUTH0_DOMAIN: string;
  export const AUTH0_CLIENT_ID: string;
  export const AUTH0_CLIENT_SECRET: string;
  export const COOKIE_SECRET: string;
  export const NODE_ENV: 'development' | 'production' | 'test';
}

// Static public environment variables
declare module '$env/static/public' {
  export const PUBLIC_URL: string;
  export const PUBLIC_BASE_URL: string;
  export const PUBLIC_GRAPHQL_WS_ENDPOINT: string;
}

// Dynamic environment variables
declare module '$env/dynamic/private' {
  export const env: {
    HASURA_ADMIN_SECRET: string;
    MY_APP_KEYS: string;
    AUTH0_DOMAIN: string;
    AUTH0_CLIENT_ID: string;
    AUTH0_CLIENT_SECRET: string;
    COOKIE_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string;
  };
}

declare module '$env/dynamic/public' {
  export const env: {
    PUBLIC_URL: string;
    PUBLIC_BASE_URL: string;
    PUBLIC_GRAPHQL_WS_ENDPOINT: string;
    [key: string]: string;
  };
}