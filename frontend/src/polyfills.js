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
}

export default {
  loaded: true
};