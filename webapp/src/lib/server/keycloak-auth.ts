import * as jose from 'jose';
import { JWTPayload, JWTVerifyResult, KeyLike, JWTVerifyOptions } from 'jose';
import { server_env } from './env';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Keycloak JWKS interface
 */
interface KeycloakJWKS {
  keys: Array<Record<string, any>>;
}

/**
 * Keycloak user information interface
 */
interface KeycloakUser {
  id: string;
  name: string | undefined;
  email: string | undefined;
  roles: string[];
  jwt: string;
}

/**
 * Keycloak token payload interface
 */
interface KeycloakTokenPayload extends JWTPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
}

// Variable to hold the Keycloak validation keys
let keycloak_keys: KeycloakJWKS | null = null;

/**
 * Initialize Keycloak validation keys by fetching them from the Keycloak server
 */
export async function init_keycloak_keys(): Promise<void> {
  if (keycloak_keys) return;
  if (!server_env.ENABLE_KEYCLOAK)
    return;

  try {
    console.log("Server-side auth keys initialization started");
    
    // Fetch JWKS (JSON Web Key Set) from Keycloak
    const keycloak_url = 'http://localhost:8080';
    const realm = 'koordinator';
    const jwks_uri = `${keycloak_url}/realms/${realm}/protocol/openid-connect/certs`;
    
    const response = await fetch(jwks_uri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Keycloak JWKS: ${response.statusText}`);
    }
    
    const jwks = await response.json() as KeycloakJWKS;
    keycloak_keys = jwks;
    
    console.log("Server-side auth keys initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Keycloak keys:", error);
    throw error;
  }
}

/**
 * Verify a Keycloak token and extract user information
 * 
 * @param token - The JWT token to verify
 * @returns The user information or null if verification fails
 */
export async function verify_keycloak_token(token: string): Promise<KeycloakUser | null> {
  if (!keycloak_keys) {
    await init_keycloak_keys();
  }
  
  try {
    // Create JWKS from the keys
    const jwks = jose.createRemoteJWKSet(
      new URL('http://localhost:8080/realms/koordinator/protocol/openid-connect/certs')
    );
    
    // Verify the token
    const verifyOptions: JWTVerifyOptions = {
      issuer: 'http://localhost:8080/realms/koordinator',
      audience: 'koordinator-webapp'
    };
    
    const { payload } = await jose.jwtVerify(token, jwks, verifyOptions);
    const keycloakPayload = payload as KeycloakTokenPayload;
    
    // Extract user information
    const user: KeycloakUser = {
      id: keycloakPayload.sub,
      name: keycloakPayload.preferred_username,
      email: keycloakPayload.email,
      roles: keycloakPayload.realm_access?.roles || [],
      jwt: token
    };
    
    return user;
  } catch (error) {
    console.error('Error verifying Keycloak token:', error);
    return null;
  }
}

/**
 * Extract and verify user from a request
 * 
 * @param event - The SvelteKit request event
 * @returns The user information or null if not authenticated
 */
export async function get_user_from_request(
  event: RequestEvent
): Promise<KeycloakUser | null> {
  try {
    // Get the authorization header
    const auth_header = event.request.headers.get('authorization');
    let token: string | null = null;
    
    if (auth_header?.startsWith('Bearer ')) {
      token = auth_header.slice(7);
    } else {
      // Try to get from cookie
      const cookies = event.cookies.getAll();
      const auth_cookie = cookies.find(c => c.name === 'keycloak_token');
      if (!auth_cookie?.value) return null;
      token = auth_cookie.value;
    }
    
    if (!token) return null;
    
    // Verify the token using Keycloak
    return await verify_keycloak_token(token);
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return null;
  }
}