import * as jose from 'jose';
import { server_env } from './env.js';

// Variable to hold the Keycloak validation keys
let keycloak_keys = null;

/**
 * Initialize Keycloak validation keys by fetching them from the Keycloak server
 */
export async function init_keycloak_keys() {
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
    
    const jwks = await response.json();
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
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object|null>} The user information or null if verification fails
 */
export async function verify_keycloak_token(token) {
  if (!keycloak_keys) {
    await init_keycloak_keys();
  }
  
  try {
    // Create JWKS from the keys
    const jwks = jose.createRemoteJWKSet(new URL('http://localhost:8080/realms/koordinator/protocol/openid-connect/certs'));
    
    // Verify the token
    const { payload } = await jose.jwtVerify(token, jwks, {
      issuer: 'http://localhost:8080/realms/koordinator',
      audience: 'koordinator-webapp'
    });
    
    // Extract user information
    const user = {
      id: payload.sub,
      name: payload.preferred_username,
      email: payload.email,
      roles: payload.realm_access?.roles || [],
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
 * @param {import('@sveltejs/kit').RequestEvent} event - The SvelteKit request event
 * @returns {Promise<Object|null>} The user information or null if not authenticated
 */
export async function get_user_from_request(event) {
  try {
    // Get the authorization header
    const auth_header = event.request.headers.get('authorization');
    let token = null;
    
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