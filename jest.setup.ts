// Mock next/server before importing anything else
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => {
      return {
        status: init?.status || 200,
        json: async () => body,
        text: async () => JSON.stringify(body),
      };
    },
  },
}));

import '@testing-library/jest-dom';

// Polyfill for Next.js server components
class RequestPolyfill {
  url: string;
  method: string;
  headers: Headers;
  
  constructor(input: string | URL, init?: RequestInit) {
    this.url = input.toString();
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
  }
}

class ResponsePolyfill {
  body: ReadableStream | null;
  bodyUsed: boolean;
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body instanceof ReadableStream ? body : null;
    this.bodyUsed = false;
    this.headers = new Headers(init?.headers);
    this.ok = (init?.status || 200) >= 200 && (init?.status || 200) < 300;
    this.redirected = false;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.type = 'default';
    this.url = '';
  }

  json(): Promise<unknown> {
    return Promise.resolve({});
  }

  text(): Promise<string> {
    return Promise.resolve('');
  }
}

// @ts-expect-error - Polyfill for jsdom
global.Request = RequestPolyfill;
// @ts-expect-error - Polyfill for jsdom
global.Response = ResponsePolyfill;

// Mock next/image since we're testing in jsdom
jest.mock('next/image', () => ({
  __esModule: true,
  default: function NextImageMock(props: { src: string; alt: string; fill?: boolean; priority?: boolean; [key: string]: unknown }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, ...rest } = props;
    // Return a regular img element
    return React.createElement('img', { ...rest, alt: props.alt });
  },
}));

// Import React after jest.mock setup
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock ResizeObserver (not available in jsdom)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
