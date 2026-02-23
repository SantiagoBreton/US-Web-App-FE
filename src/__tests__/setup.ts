// Import polyfills first before anything else
import './polyfills';
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Comprehensive polyfills for CI environment
if (typeof global !== 'undefined') {
  // TextEncoder/TextDecoder polyfills
  if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
  }

  // URL polyfills
  if (typeof global.URL === 'undefined') {
    global.URL = require('url').URL;
  }

  if (typeof global.URLSearchParams === 'undefined') {
    global.URLSearchParams = require('url').URLSearchParams;
  }

  // Fetch polyfills using undici
  if (typeof global.fetch === 'undefined') {
    try {
      const { fetch, Headers, Request, Response } = require('undici');
      global.fetch = fetch;
      global.Headers = Headers;
      global.Request = Request;
      global.Response = Response;
    } catch (error) {
      console.warn('Could not load undici polyfills:', error instanceof Error ? error.message : String(error));
    }
  }

  // Additional polyfills for webidl-conversions compatibility
  if (typeof global.Map === 'undefined') {
    global.Map = Map;
  }
  
  if (typeof global.Set === 'undefined') {
    global.Set = Set;
  }
  
  if (typeof global.WeakMap === 'undefined') {
    global.WeakMap = WeakMap;
  }
  
  if (typeof global.WeakSet === 'undefined') {
    global.WeakSet = WeakSet;
  }
}

// Only import MSW after polyfills are set up
let server: any;
try {
  // Use require for Node.js compatibility
  const serverModule = require('./utils/mocks/server');
  server = serverModule.server;
} catch (error) {
  console.warn('MSW server not available, tests will run without API mocking');
  server = null;
}

// Remove router mock from global setup - it's causing issues
// Mocks will be handled in individual test files or test-utils

// Remove global fetch mock since we're using MSW
// global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    localStorageStore = {};
  }),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.confirm and window.alert
global.confirm = vi.fn(() => true);
global.alert = vi.fn();

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000/api',
    MODE: 'test'
  },
  writable: true
});

// MSW server setup - only if successfully loaded
beforeAll(() => {
  if (server) {
    server.listen({ onUnhandledRequest: 'warn' });
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  // Reset localStorage for each test
  localStorageStore = {};
});

afterEach(() => {
  if (server) {
    server.resetHandlers();
  }
  cleanup();
});

afterAll(() => {
  if (server) {
    server.close();
  }
});