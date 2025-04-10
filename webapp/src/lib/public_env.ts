/**
 * Public environment interface
 */
export interface PublicEnv {
    GRAPHQL_ENDPOINT: string;
    PUBLIC_URL: string;
    PUBLIC_BASE_URL: string;
    ENABLE_KEYCLOAK: boolean;
    KEYCLOAK_URL: string;
    KEYCLOAK_REALM: string;
    KEYCLOAK_CLIENT_ID: string;
    PUBLIC_GRAPHQL_HEADERS: Record<string, string>;
}

export const public_env: PublicEnv = {
    GRAPHQL_ENDPOINT: import.meta.env.VITE_PUBLIC_GRAPHQL_ENDPOINT as string,
    PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL as string,
    PUBLIC_BASE_URL: import.meta.env.VITE_PUBLIC_BASE_URL as string,
    ENABLE_KEYCLOAK: !!import.meta.env.VITE_PUBLIC_ENABLE_KEYCLOAK,
    KEYCLOAK_URL: import.meta.env.VITE_PUBLIC_KEYCLOAK_URL as string,
    KEYCLOAK_REALM: import.meta.env.VITE_PUBLIC_KEYCLOAK_REALM as string,
    KEYCLOAK_CLIENT_ID: import.meta.env.VITE_PUBLIC_KEYCLOAK_CLIENT_ID as string,
    // Parse Hasura headers from environment
    PUBLIC_GRAPHQL_HEADERS: (() => {
        try {
            return JSON.parse((import.meta.env.VITE_PUBLIC_GRAPHQL_HEADERS as string) || '{"content-type":"application/json"}');
        } catch (e) {
            console.error('Error parsing VITE_PUBLIC_GRAPHQL_HEADERS:', e);
            return { 'content-type': 'application/json' };
        }
    })(),
};

/**
 * Helper function to get API URL
 * @param path - API path
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
    return `${public_env.PUBLIC_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
