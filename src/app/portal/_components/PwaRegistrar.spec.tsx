import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

import PwaRegistrar from './PwaRegistrar'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PwaRegistrar', () => {
  it('registers the service worker with the correct scope', () => {
    const registerMock = vi.fn(() =>
      Promise.resolve({} as ServiceWorkerRegistration),
    )
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: registerMock },
      configurable: true,
    })

    render(<PwaRegistrar />)

    expect(registerMock).toHaveBeenCalledWith('/portal-sw.js', {
      scope: '/portal',
    })
  })

  it('renders nothing', () => {
    const { container } = render(<PwaRegistrar />)
    expect(container.innerHTML).toBe('')
  })

  it('does not throw when serviceWorker is unavailable', () => {
    // Delete the property so 'serviceWorker' in navigator returns false
    const descriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'serviceWorker',
    )
    // @ts-expect-error -- deleting for test purposes
    delete navigator.serviceWorker
    try {
      expect(() => render(<PwaRegistrar />)).not.toThrow()
    } finally {
      if (descriptor)
        Object.defineProperty(navigator, 'serviceWorker', descriptor)
    }
  })
})
