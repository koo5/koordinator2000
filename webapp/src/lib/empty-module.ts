/**
 * Empty module implementation for Node.js modules in browser
 * Provides stubs for commonly used functions
 */

/**
 * fs module stubs
 */
export const existsSync = (path: string): boolean => false;
export const readFileSync = (path: string, options?: string | { encoding?: string; flag?: string }): string => '';

/**
 * path module stubs (if path-browserify fails)
 */
export const dirname = (path: string): string => '';
export const join = (...args: string[]): string => args.join('/');
export const relative = (from: string, to: string): string => '';
export const resolve = (...paths: string[]): string => '';
export const isAbsolute = (path: string): boolean => false;
export const sep: string = '/';

/**
 * source-map-js stubs
 */
export class SourceMapConsumer {
    constructor() {}
}

export class SourceMapGenerator {
    constructor() {}
}

/**
 * Default export for modules that use default import
 */
export default {};
