/**
 * Wrapper around fetch that automatically includes authentication token
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function authFetch(url, options = {}) {
  // Clone the options to avoid modifying the original
  const fetchOptions = { ...options };
  
  // Initialize headers if not present
  fetchOptions.headers = fetchOptions.headers || {};
  
  // Add auth token if available
  if (typeof window !== 'undefined' && window.authToken) {
    fetchOptions.headers.Authorization = `Bearer ${window.authToken}`;
  } else if (typeof localStorage !== 'undefined') {
    // Try to get token from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.jwt) {
        fetchOptions.headers.Authorization = `Bearer ${userData.jwt}`;
        // Also set it on window for future requests
        if (typeof window !== 'undefined') {
          window.authToken = userData.jwt;
        }
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
