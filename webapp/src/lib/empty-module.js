// Empty module implementation for Node.js modules in browser
// Provides stubs for commonly used functions

// fs module stubs
export const existsSync = () => false;
export const readFileSync = () => '';

// path module stubs (if path-browserify fails)
export const dirname = () => '';
export const join = (...args) => args.join('/');
export const relative = () => '';
export const resolve = () => '';
export const isAbsolute = () => false;
export const sep = '/';

// source-map-js stubs
export class SourceMapConsumer {}
export class SourceMapGenerator {}

// Default export for modules that use default import
export default {};