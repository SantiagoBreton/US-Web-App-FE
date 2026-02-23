// Comprehensive polyfills for CI environments
// This file ensures compatibility with Node.js environments that lack web APIs

// Essential polyfills for webidl-conversions compatibility
if (typeof globalThis === 'undefined') {
  (global as any).globalThis = global;
}

// Core collection polyfills
if (typeof globalThis.Map === 'undefined') {
  globalThis.Map = Map;
}

if (typeof globalThis.Set === 'undefined') {
  globalThis.Set = Set;
}

if (typeof globalThis.WeakMap === 'undefined') {
  globalThis.WeakMap = WeakMap;
}

if (typeof globalThis.WeakSet === 'undefined') {
  globalThis.WeakSet = WeakSet;
}

// Web API polyfills
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = require('url').URL;
}

if (typeof globalThis.URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = require('url').URLSearchParams;
}

// Fetch API polyfill
if (typeof globalThis.fetch === 'undefined') {
  try {
    const { fetch, Headers, Request, Response } = require('undici');
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
  } catch (error) {
    console.warn('Undici polyfill not available:', error);
  }
}

// Additional compatibility fixes
if (typeof globalThis.crypto === 'undefined') {
  try {
    const { webcrypto } = require('crypto');
    globalThis.crypto = webcrypto;
  } catch (error) {
    // Crypto not available, that's okay
  }
}

// Export for module systems
export {};