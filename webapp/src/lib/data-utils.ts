/**
 * Data utilities for SvelteKit applications
 * Includes GraphQL helpers and data transformation functions
 */
import { handleApiError } from './error-utils';

/**
 * Generic query result interface
 */
export interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Create an empty query result
 */
export function createEmptyResult<T>(): QueryResult<T> {
  return {
    data: null,
    loading: false,
    error: null
  };
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error ${response.status}: ${text}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw handleApiError(error);
  }
}

/**
 * Parse and validate GraphQL response
 */
export function parseGraphQLResponse<T>(response: any): T {
  if (response?.errors?.length) {
    const error = response.errors[0];
    throw new Error(error.message || 'GraphQL error');
  }
  
  if (!response?.data) {
    throw new Error('Invalid GraphQL response');
  }
  
  return response.data as T;
}

/**
 * Format data for API consumption
 */
export function formatApiData<T>(data: T): Record<string, any> {
  // Remove undefined values and format dates
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    })
  );
}

/**
 * Flatten nested objects for form handling
 */
export function flattenObject(
  obj: Record<string, any>, 
  prefix: string = ''
): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (
      obj[key] !== null && 
      typeof obj[key] === 'object' && 
      !(obj[key] instanceof Date) &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    
    return acc;
  }, {} as Record<string, any>);
}