/**
 * Enhanced TypeScript definitions for SvelteKit
 */

import type { LoadEvent as KitLoadEvent } from '@sveltejs/kit';

// Enhanced Navigation type
declare global {
  type NavigationOptions = {
    replaceState?: boolean;
    noScroll?: boolean;
    keepFocus?: boolean;
    invalidateAll?: boolean;
  };

  // Extend LoadEvent with common properties we use
  interface LoadEvent extends KitLoadEvent {
    fetch: typeof fetch;
    params: Record<string, string>;
    url: URL;
  }

  // Strongly typed page data
  interface PageData {
    [key: string]: any;
  }

  // Error type
  interface AppError {
    status: number;
    message: string;
    stack?: string;
  }

  // SvelteKit route lifecycle hooks
  interface HandleFetch {
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }

  interface HandleServerError {
    (error: Error & { frame?: string; loc?: object }, event: KitLoadEvent): Promise<AppError>;
  }
}