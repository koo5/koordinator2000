/**
 * Client-side authentication utilities
 */
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getApiUrl } from '$lib/public_env';
import { setAuthToken } from '$lib/fetch-utils';
import { addNotification, user, type User } from '$lib/stores';

/**
 * Login user data request interface
 */
interface LoginRequestData {
    email?: string;
}

/**
 * Register user data request interface
 */
interface RegisterRequestData {
    name: string;
    email: string;
}

/**
 * Login a user using credentials (email/password) or create a guest user
 *
 * @param email - Optional email for login
 * @param password - Optional password for login
 * @param redirectTo - Where to redirect after login
 * @returns The logged in user data
 */
export async function login(email: string | null = null, password: string | null = null, redirectTo: string = '/'): Promise<User> {
    try {
        // Determine if using credentials or guest login
        const useCredentials = !!(email && password);
        let userData: User;

        if (useCredentials) {
            // This would be a real login with credentials in a production app
            // For now, we'll use the free user ID endpoint with email info
            const requestData: LoginRequestData = {};
            if (email) requestData.email = email;

            const response = await fetch(getApiUrl('/get_free_user_id'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
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
                    'Content-Type': 'application/json',
                },
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
        const error = err as Error;
        addNotification(error.message || 'Failed to login', 'error');
        throw err;
    }
}

/**
 * Register a new user
 *
 * @param name - Username
 * @param email - User email
 * @param password - User password
 * @returns The created user object
 */
export async function register(name: string, email: string, password: string): Promise<User> {
    try {
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        const requestData: RegisterRequestData = {
            name,
            email,
        };

        // Register user using server endpoint
        const response = await fetch(getApiUrl('/get_free_user_id'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const userData: User = await response.json();

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
        const error = err as Error;
        addNotification(error.message || 'Failed to register', 'error');
        throw err;
    }
}

/**
 * Logout the current user
 */
export function logout(): void {
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
 * @returns True if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
    if (!browser) return false;

    try {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser) as User;
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
