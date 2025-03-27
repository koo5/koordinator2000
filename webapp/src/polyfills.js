// Minimal browser polyfills for Node.js compatibility
import { browser } from '$app/environment';

// Only run in browser environment
if (browser) {
  // Global object
  if (typeof global === 'undefined') {
    window.global = window;
  }
  
  // Node.js globals
  if (typeof process === 'undefined') {
    window.process = { 
      env: {}, 
      browser: true,
      version: '',
      versions: {}
    };
  }
  
  // Add Node.js specific globals
  if (typeof globalThis.__dirname === 'undefined') {
    globalThis.__dirname = '/';
  }
  
  if (typeof globalThis.__filename === 'undefined') {
    globalThis.__filename = '/index.js';
  }
  
  // Path module polyfill
  if (!window.path) {
    window.path = {
      dirname: function(path) {
        return path.replace(/\/[^\/]*$/, '');
      },
      relative: function(from, to) {
        return to;
      },
      resolve: function() {
        const args = Array.from(arguments);
        return args.join('/').replace(/\/+/g, '/');
      },
      sep: '/'
    };
  }
  
  // Source-map-js polyfill stubs
  if (!window['source-map-js']) {
    window['source-map-js'] = {
      SourceMapConsumer: function() {},
      SourceMapGenerator: function() {}
    };
  }
  
  // URL polyfill
  if (!window.url) {
    window.url = {
      pathToFileURL: function(path) {
        return new URL('file://' + path);
      }
    };
  }
}

export default {
  loaded: true
};