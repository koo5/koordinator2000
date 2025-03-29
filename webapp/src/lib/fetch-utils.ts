/**
 * Wrapper around fetch that automatically includes authentication token
 */
import { browser } from '$app/environment';

/**
 * User data interface
 */
interface UserData {
  jwt?: string;
  [key: string]: any;
}

// Use a module-level variable instead of window.authToken
let authToken: string | null = null;

/**
 * Function to set the auth token
 * @param token - Auth token string
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Function to get the auth token
 * @returns Current auth token
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Fetch with authentication token
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The fetch response
 */
export async function authFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Clone the options to avoid modifying the original
  const fetchOptions: RequestInit = { ...options };
  
  // Initialize headers if not present
  fetchOptions.headers = fetchOptions.headers || {};
  
  // Need to create a mutable headers object
  const headers: Record<string, string> = {};
  
  // Copy existing headers
  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(fetchOptions.headers)) {
      // Handle array of header entries
      for (const [key, value] of fetchOptions.headers) {
        headers[key] = value;
      }
    } else {
      // Handle record object
      Object.assign(headers, fetchOptions.headers as Record<string, string>);
    }
  }
  
  // Add auth token if available
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  } else if (browser && typeof localStorage !== 'undefined') {
    // Try to get token from localStorage (only in browser)
    try {
      const userData: UserData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.jwt) {
        headers.Authorization = `Bearer ${userData.jwt}`;
        // Also set it for future requests
        authToken = userData.jwt;
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
    }
  }
  
  // Set updated headers
  fetchOptions.headers = headers;
  
  // Make the request
  return fetch(url, fetchOptions);
}

/**
 * Wrapper around fetch that handles JSON responses and errors
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The parsed JSON response
 */
export async function fetchJson<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await authFetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
