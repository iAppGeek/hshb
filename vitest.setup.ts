import '@testing-library/jest-dom'

// @headlessui/react Menu (floating UI) uses ResizeObserver in tests.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// vitest's coverage runner passes --localstorage-file to jsdom without a valid
// path, which leaves window.localStorage as a broken stub with no methods.
// Provide a real in-memory implementation so every test file has a working localStorage.
if (typeof window.localStorage.getItem !== 'function') {
  const store: Record<string, string> = {}
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k])
      },
      get length() {
        return Object.keys(store).length
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
    } satisfies Storage,
    writable: true,
  })
}
