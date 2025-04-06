/**
 * JWT utilities for client-side operations
 */

/**
 * Parse a JWT token and extract the payload
 * @param token JWT token string
 * @returns Parsed payload as an object, or null if invalid
 */
export function parseJwt(token: string): any {
  if (!token) return null;

  try {
    // Split the token and get the payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

