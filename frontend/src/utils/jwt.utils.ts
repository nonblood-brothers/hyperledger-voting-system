import { TokenPayload } from '../types';

/**
 * Decodes a JWT token without verification
 * This is a client-side utility function that extracts the payload from a JWT token
 * Note: This does not verify the token's signature, it only decodes the payload
 * @param token The JWT token to decode
 * @returns The decoded token payload
 */
export function decodeToken<T = any>(token: string): T {
  try {
    // Split the token into its parts
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Base64Url decode the payload (second part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Failed to decode token');
  }
}