import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/push-client', () => ({
  urlBase64ToUint8Array: vi.fn(() => new Uint8Array()),
  saveSubscription: vi.fn(),
  removeSubscription: vi.fn(),
}))

import { saveSubscription, removeSubscription } from '@/lib/push-client'

import NotificationToggle from './NotificationToggle'

function setStandalone(value: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: value }),
  })
}

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
  it('renders nothing when not in standalone mode', () => {
    setStandalone(false)
    const { container } = render(<NotificationToggle />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when PushManager is unsupported', () => {
    setStandalone(true)
    // @ts-expect-error -- removing for test
    delete window.PushManager
    const { container } = render(<NotificationToggle />)
    expect(container.innerHTML).toBe('')
  })

  it('shows "Notifications blocked" when permission is denied', async () => {
    setStandalone(true)
    vi.stubGlobal('Notification', { permission: 'denied' })
    setupServiceWorker(null)
    render(<NotificationToggle />)
    await waitFor(() => {
      expect(screen.getByText('Notifications blocked')).toBeDefined()
    })
  })

  it('shows unsubscribed bell when no active subscription', async () => {
    setStandalone(true)
    setupServiceWorker(null)
    render(<NotificationToggle />)
    await waitFor(() => {
      expect(screen.getByTitle('Enable notifications')).toBeDefined()
    })
  })

  it('shows subscribed bell when an active subscription exists', async () => {
    setStandalone(true)
    setupServiceWorker({} as PushSubscription)
    render(<NotificationToggle />)
    await waitFor(() => {
      expect(screen.getByTitle('Disable notifications')).toBeDefined()
    })
  })

  it('calls saveSubscription when subscribe button is clicked', async () => {
    setStandalone(true)
    const mockSub = { endpoint: 'https://example.com' } as PushSubscription
    const { subscribe, getSubscription } = setupServiceWorker(null)
    subscribe.mockResolvedValue(mockSub)
    getSubscription.mockResolvedValue(null)
    vi.mocked(saveSubscription).mockResolvedValue(undefined)

    render(<NotificationToggle />)
    const btn = await screen.findByTitle('Enable notifications')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(saveSubscription).toHaveBeenCalledWith(mockSub)
    })
  })

  it('stays unsubscribed when pushManager.subscribe throws', async () => {
    setStandalone(true)
    const { subscribe } = setupServiceWorker(null)
    subscribe.mockRejectedValue(new Error('Permission denied'))

    render(<NotificationToggle />)
    const btn = await screen.findByTitle('Enable notifications')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByTitle('Enable notifications')).toBeDefined()
    })
  })

  it('calls removeSubscription when unsubscribe button is clicked', async () => {
    setStandalone(true)
    const mockSub = {
      endpoint: 'https://example.com',
      unsubscribe: vi.fn().mockResolvedValue(true),
    } as unknown as PushSubscription
    setupServiceWorker(mockSub)
    vi.mocked(removeSubscription).mockResolvedValue(undefined)

    render(<NotificationToggle />)
    const btn = await screen.findByTitle('Disable notifications')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(removeSubscription).toHaveBeenCalledWith(mockSub.endpoint)
    })
  })
})
