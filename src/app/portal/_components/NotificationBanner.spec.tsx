import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/push-client', () => ({
  urlBase64ToUint8Array: vi.fn(() => new Uint8Array()),
  saveSubscription: vi.fn(),
}))

import { saveSubscription } from '@/lib/push-client'

import NotificationBanner from './NotificationBanner'

const DISMISSED_KEY = 'push-notif-dismissed'

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
  localStorage.clear()
  Object.defineProperty(window, 'PushManager', {
    value: {},
    configurable: true,
  })
  vi.stubGlobal('Notification', { permission: 'default' })
})

describe('NotificationBanner', () => {
  it('renders nothing when PushManager is unsupported', () => {
    // @ts-expect-error -- removing for test
    delete window.PushManager
    const { container } = render(<NotificationBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when already dismissed', async () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setupServiceWorker(null)
    const { container } = render(<NotificationBanner />)
    await waitFor(() => expect(container.innerHTML).toBe(''))
  })

  it('renders nothing when already subscribed', async () => {
    setupServiceWorker({} as PushSubscription)
    const { container } = render(<NotificationBanner />)
    await waitFor(() => expect(container.innerHTML).toBe(''))
  })

  it('renders nothing when permission is denied', async () => {
    vi.stubGlobal('Notification', { permission: 'denied' })
    setupServiceWorker(null)
    const { container } = render(<NotificationBanner />)
    await waitFor(() => expect(container.innerHTML).toBe(''))
  })

  it('shows the banner when unsubscribed and not dismissed', async () => {
    setupServiceWorker(null)
    render(<NotificationBanner />)
    await waitFor(() => {
      expect(
        screen.getByText(
          'Enable notifications to be alerted when attendance is saved',
        ),
      ).toBeDefined()
    })
  })

  it('hides the banner after clicking Enable (subscribe succeeds)', async () => {
    const mockSub = { endpoint: 'https://example.com' } as PushSubscription
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockResolvedValue(mockSub)
    vi.mocked(saveSubscription).mockResolvedValue(undefined)

    render(<NotificationBanner />)
    const btn = await screen.findByText('Enable')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.queryByText('Enable')).toBeNull()
    })
  })

  it('keeps the banner visible when subscribe throws', async () => {
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockRejectedValue(new Error('Permission denied'))

    render(<NotificationBanner />)
    const btn = await screen.findByText('Enable')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('Enable')).toBeDefined()
    })
  })

  it('hides the banner and sets localStorage key when dismissed', async () => {
    setupServiceWorker(null)

    render(<NotificationBanner />)
    await screen.findByText('Enable')
    fireEvent.click(screen.getByLabelText('Dismiss'))

    await waitFor(() => {
      expect(screen.queryByText('Enable')).toBeNull()
    })
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('1')
  })

  it('dispatches push-subscription-changed event on successful subscribe', async () => {
    const mockSub = { endpoint: 'https://example.com' } as PushSubscription
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockResolvedValue(mockSub)
    vi.mocked(saveSubscription).mockResolvedValue(undefined)

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    render(<NotificationBanner />)
    const btn = await screen.findByText('Enable')
    fireEvent.click(btn)

    await waitFor(() => {
      const dispatched = dispatchSpy.mock.calls.find(
        ([e]) => e instanceof Event && e.type === 'push-subscription-changed',
      )
      expect(dispatched).toBeDefined()
    })
  })

  it('does not dispatch push-subscription-changed when subscribe throws', async () => {
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockRejectedValue(new Error('Permission denied'))

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    render(<NotificationBanner />)
    const btn = await screen.findByText('Enable')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('Enable')).toBeDefined()
    })

    const dispatched = dispatchSpy.mock.calls.find(
      ([e]) => e instanceof Event && e.type === 'push-subscription-changed',
    )
    expect(dispatched).toBeUndefined()
  })
})
