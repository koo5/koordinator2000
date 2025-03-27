/**
 * Type definitions for browser environment globals and polyfills
 */

// Global polyfills
interface Window {
  // Path module polyfill
  path?: {
    dirname: (path: string) => string;
    relative: (from: string, to: string) => string;
  };
  
  // URL polyfill
  url?: {
    pathToFileURL: (path: string) => string;
    fileURLToPath: (url: string) => string;
  };
  
  // Source-map-js polyfill
  ['source-map-js']?: {
    SourceMapConsumer: any;
    SourceMapGenerator: any;
  };
}

// Node.js process polyfill
interface Process {
  version: string;
  versions: {
    node?: string;
    v8?: string;
    http_parser?: string;
    ares?: string;
    [key: string]: string | undefined;
  };
  env: {
    [key: string]: string | undefined;
  };
  cwd: () => string;
}

declare var process: Process;

// Service worker types
interface ExtendedEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends ExtendedEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

// Extend window object
interface Window {
  clients: {
    claim(): Promise<void>;
  };
  caches: CacheStorage;
}

// Declare global fetch types
declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;