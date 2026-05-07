import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

vi.mock('@/data/events', () => ({ sendEvent: vi.fn() }))
import { sendEvent } from '@/data/events'

import { CalendarEmbed } from './CalendarEmbed'

const src = 'https://calendar.google.com/calendar/embed?src=test%40gmail.com'
const title = 'Test Calendar'

type IOCallback = (entries: IntersectionObserverEntry[]) => void
let intersectionCallback: IOCallback
const observeMock = vi.fn()
const disconnectMock = vi.fn()

class MockIntersectionObserver {
  constructor(cb: IOCallback) {
    intersectionCallback = cb
  }
  observe = observeMock
  disconnect = disconnectMock
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  observeMock.mockReset()
  disconnectMock.mockReset()
})

describe('CalendarEmbed', () => {
  it('renders a placeholder skeleton before the section enters the viewport', () => {
    render(<CalendarEmbed src={src} title={title} />)
    expect(screen.queryByTitle(title)).toBeNull()
  })

  it('renders the iframe once the section scrolls into view', () => {
    render(<CalendarEmbed src={src} title={title} />)

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as unknown as IntersectionObserverEntry,
      ])
    })

    const iframe = screen.getByTitle(title) as HTMLIFrameElement
    expect(iframe).toBeTruthy()
    expect(iframe.src).toBe(src)
  })

  it('disconnects the observer after the iframe loads', () => {
    render(<CalendarEmbed src={src} title={title} />)

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as unknown as IntersectionObserverEntry,
      ])
    })

    expect(disconnectMock).toHaveBeenCalled()
  })

  it('does not load the iframe when the section is not yet visible', () => {
    render(<CalendarEmbed src={src} title={title} />)

    act(() => {
      intersectionCallback([
        { isIntersecting: false } as unknown as IntersectionObserverEntry,
      ])
    })

    expect(screen.queryByTitle(title)).toBeNull()
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<CalendarEmbed src={src} title={title} />)
    unmount()
    expect(disconnectMock).toHaveBeenCalled()
  })

  it('fires a GA view event when the calendar scrolls into view', () => {
    render(<CalendarEmbed src={src} title={title} />)

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as unknown as IntersectionObserverEntry,
      ])
    })

    expect(sendEvent).toHaveBeenCalledWith(
      'view',
      'calendar-scrolled-into-view',
    )
  })

  it('does not fire a GA event when the section is not intersecting', () => {
    render(<CalendarEmbed src={src} title={title} />)

    act(() => {
      intersectionCallback([
        { isIntersecting: false } as unknown as IntersectionObserverEntry,
      ])
    })

    expect(sendEvent).not.toHaveBeenCalled()
  })

  it('applies the provided height to the wrapper', () => {
    const { container } = render(
      <CalendarEmbed src={src} title={title} height={600} />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper?.style.height).toBe('600px')
  })

  it('applies the provided height to the iframe', () => {
    render(<CalendarEmbed src={src} title={title} height={600} />)

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as unknown as IntersectionObserverEntry,
      ])
    })

    const iframe = screen.getByTitle(title) as HTMLIFrameElement
    expect(iframe.height).toBe('600')
  })
})
