import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/push-client', () => ({
  urlBase64ToUint8Array: vi.fn(() => new Uint8Array()),
  saveSubscription: vi.fn(),
  removeSubscription: vi.fn(),
}))

import { saveSubscription, removeSubscription } from '@/lib/push-client'

import NotificationToggle from './NotificationToggle'

function setupServiceWorker(sub: PushSubscription | null = null) {
  const getSubscription = vi.fn().mockResolvedValue(sub)
  const subscribe = vi.fn()
  const pushManager = { getSubscription, subscribe }
  const ready = Promise.resolve({ pushManager })
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { ready },
    configurable: true,
  })
  return { getSubscription, subscribe, pushManager }
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(window, 'PushManager', {
    value: {},
    configurable: true,
  })
  vi.stubGlobal('Notification', { permission: 'default' })
})

describe('NotificationToggle', () => {
  it('renders nothing when PushManager is unsupported', () => {
    // @ts-expect-error -- removing for test
    delete window.PushManager
    const { container } = render(<NotificationToggle />)
    expect(container.innerHTML).toBe('')
  })

  it('shows "Notifications blocked" when permission is denied', async () => {
    vi.stubGlobal('Notification', { permission: 'denied' })
    setupServiceWorker(null)
    render(<NotificationToggle />)
    await waitFor(() => {
      expect(screen.getByText('Notifications blocked')).toBeDefined()
    })
  })

  it('shows Off pill when no active subscription', async () => {
    setupServiceWorker(null)
    render(<NotificationToggle />)
    await waitFor(() => {
      expect(screen.getByText('Off')).toBeDefined()
    })
  })

  it('shows On pill when an active subscription exists', async () => {
    setupServiceWorker({} as PushSubscription)
    render(<NotificationToggle />)
    await waitFor(() => {
      expect(screen.getByText('On')).toBeDefined()
    })
  })

  it('calls saveSubscription when subscribe button is clicked', async () => {
    const mockSub = { endpoint: 'https://example.com' } as PushSubscription
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockResolvedValue(mockSub)
    vi.mocked(saveSubscription).mockResolvedValue(undefined)

    render(<NotificationToggle />)
    await waitFor(() => screen.getByText('Off'))
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(saveSubscription).toHaveBeenCalledWith(mockSub)
    })
  })

  it('stays unsubscribed when pushManager.subscribe throws', async () => {
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockRejectedValue(new Error('Permission denied'))

    render(<NotificationToggle />)
    await waitFor(() => screen.getByText('Off'))
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Off')).toBeDefined()
    })
  })

  it('calls removeSubscription when unsubscribe button is clicked', async () => {
    const mockSub = {
      endpoint: 'https://example.com',
      unsubscribe: vi.fn().mockResolvedValue(true),
    } as unknown as PushSubscription
    setupServiceWorker(mockSub)
    vi.mocked(removeSubscription).mockResolvedValue(undefined)

    render(<NotificationToggle />)
    await waitFor(() => screen.getByText('On'))
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(removeSubscription).toHaveBeenCalledWith(mockSub.endpoint)
    })
  })

  describe('event listener lifecycle', () => {
    it('adds focus and push-subscription-changed listeners on mount', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      setupServiceWorker(null)
      render(<NotificationToggle />)
      await waitFor(() => screen.getByText('Off'))

      expect(addSpy).toHaveBeenCalledWith('focus', expect.any(Function))
      expect(addSpy).toHaveBeenCalledWith(
        'push-subscription-changed',
        expect.any(Function),
      )
    })

    it('removes focus and push-subscription-changed listeners on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      setupServiceWorker(null)
      const { unmount } = render(<NotificationToggle />)
      unmount()

      expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith(
        'push-subscription-changed',
        expect.any(Function),
      )
    })

    it('re-checks subscription when push-subscription-changed fires', async () => {
      const getSubscription = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({} as PushSubscription)
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({
            pushManager: { getSubscription, subscribe: vi.fn() },
          }),
        },
        configurable: true,
      })

      render(<NotificationToggle />)
      await waitFor(() => screen.getByText('Off'))

      window.dispatchEvent(new Event('push-subscription-changed'))

      await waitFor(() => screen.getByText('On'))
    })

    it('re-checks subscription when window focus event fires', async () => {
      const getSubscription = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({} as PushSubscription)
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({
            pushManager: { getSubscription, subscribe: vi.fn() },
          }),
        },
        configurable: true,
      })

      render(<NotificationToggle />)
      await waitFor(() => screen.getByText('Off'))

      window.dispatchEvent(new Event('focus'))

      await waitFor(() => screen.getByText('On'))
    })

    it('uses the same handler reference for add and remove', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      setupServiceWorker(null)

      const { unmount } = render(<NotificationToggle />)

      const addedFocusHandler = addSpy.mock.calls.find(
        ([event]) => event === 'focus',
      )?.[1]
      const addedEventHandler = addSpy.mock.calls.find(
        ([event]) => event === 'push-subscription-changed',
      )?.[1]

      unmount()

      const removedFocusHandler = removeSpy.mock.calls.find(
        ([event]) => event === 'focus',
      )?.[1]
      const removedEventHandler = removeSpy.mock.calls.find(
        ([event]) => event === 'push-subscription-changed',
      )?.[1]

      expect(addedFocusHandler).toBe(removedFocusHandler)
      expect(addedEventHandler).toBe(removedEventHandler)
    })
  })
})
