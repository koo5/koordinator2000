/**
 * Wrapper around fetch that automatically includes authentication token
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
import { browser } from '$app/environment';

// Use a module-level variable instead of window.authToken
let authToken = null;

// Function to set the auth token
export function setAuthToken(token) {
  authToken = token;
}

// Function to get the auth token
export function getAuthToken() {
  return authToken;
}

export async function authFetch(url, options = {}) {
  // Clone the options to avoid modifying the original
  const fetchOptions = { ...options };
  
  // Initialize headers if not present
  fetchOptions.headers = fetchOptions.headers || {};
  
  // Add auth token if available
  if (authToken) {
    fetchOptions.headers.Authorization = `Bearer ${authToken}`;
  } else if (browser && typeof localStorage !== 'undefined') {
    // Try to get token from localStorage (only in browser)
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.jwt) {
        fetchOptions.headers.Authorization = `Bearer ${userData.jwt}`;
        // Also set it for future requests
        authToken = userData.jwt;
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
    }
  }
  
  // Make the request
  return fetch(url, fetchOptions);
}

/**
 * Wrapper around fetch that handles JSON responses and errors
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function fetchJson(url, options = {}) {
  try {
    const response = await authFetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
