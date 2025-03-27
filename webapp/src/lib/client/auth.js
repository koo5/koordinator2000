/**
 * Client-side authentication utilities
 */
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getApiUrl } from '$lib/public_env.js';
import { setAuthToken } from '$lib/fetch-utils.js';
import { user, addNotification } from '$lib/stores.js';

/**
 * Login a user using credentials (email/password) or create a guest user
 * 
 * @param {string} email - Optional email for login
 * @param {string} password - Optional password for login
 * @param {string} redirectTo - Where to redirect after login
 * @returns {Promise<void>}
 */
export async function login(email = null, password = null, redirectTo = '/') {
  try {
    // Determine if using credentials or guest login
    const useCredentials = !!(email && password);
    let userData;
    
    if (useCredentials) {
      // This would be a real login with credentials in a production app
      // For now, we'll use the free user ID endpoint with email info
      const response = await fetch(getApiUrl('/get_free_user_id'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error('Failed to login with credentials');
      }
      
      userData = await response.json();
      userData.email = email;
    } else {
      // Get a free user ID (guest login)
      const response = await fetch(getApiUrl('/get_free_user_id'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user ID');
      }
      
      userData = await response.json();
    }
    
    // Store user data
    user.set(userData);
    if (browser) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Set auth token for future requests
    if (userData.jwt) {
      setAuthToken(userData.jwt);
    }
    
    // Show success notification
    addNotification('Successfully logged in', 'success');
    
    // Redirect after successful login
    goto(redirectTo);
    
    return userData;
  } catch (err) {
    console.error('Login error:', err);
    addNotification(err.message || 'Failed to login', 'error');
    throw err;
  }
}

/**
 * Register a new user
 * 
 * @param {string} name - Username
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} The created user object
 */
export async function register(name, email, password) {
  try {
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    // Register user using server endpoint
    const response = await fetch(getApiUrl('/get_free_user_id'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const userData = await response.json();
    
    // Store user data
    user.set(userData);
    if (browser) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Set auth token for future requests
    if (userData.jwt) {
      setAuthToken(userData.jwt);
    }
    
    // Show success notification
    addNotification('Registration successful! Welcome to Koordinator.', 'success');
    
    return userData;
  } catch (err) {
    console.error('Registration error:', err);
    addNotification(err.message || 'Failed to register', 'error');
    throw err;
  }
}

/**
 * Logout the current user
 */
export function logout() {
  user.set(null);
  if (browser) {
    localStorage.removeItem('user');
  }
  setAuthToken(null);
  addNotification('Successfully logged out', 'info');
  goto('/login');
}

/**
 * Check if a user is logged in and restore session
 * @returns {Promise<boolean>}
 */
export async function checkAuth() {
  if (!browser) return false;
  
  try {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      user.set(userData);
      
      // Set auth token for future requests
      if (userData.jwt) {
        setAuthToken(userData.jwt);
      }
      
      return true;
    }
  } catch (err) {
    console.error('Auth initialization error:', err);
  }
  
  return false;
}
