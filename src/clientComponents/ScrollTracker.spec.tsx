import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

import { sendEvent } from '@/data/events'

import { ScrollTracker } from './ScrollTracker'

vi.mock('@/data/events', () => ({ sendEvent: vi.fn() }))

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
let intersectionCallback: (
  entries: Partial<IntersectionObserverEntry>[],
) => void

beforeEach(() => {
  vi.clearAllMocks()

  class MockIntersectionObserver {
    constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void) {
      intersectionCallback = cb
    }
    observe = mockObserve
    disconnect = mockDisconnect
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

  document.body.innerHTML = '<div id="about-us"></div>'
})

describe('ScrollTracker', () => {
  it('observes the target section element', () => {
    render(<ScrollTracker section="about-us" />)
    expect(mockObserve).toHaveBeenCalledWith(
      document.getElementById('about-us'),
    )
  })

  it('fires sendEvent once when section becomes visible', () => {
    render(<ScrollTracker section="about-us" />)
    intersectionCallback([{ isIntersecting: true }])
    expect(sendEvent).toHaveBeenCalledWith('scroll', 'section-view', {
      section: 'about-us',
    })
    expect(sendEvent).toHaveBeenCalledTimes(1)
  })

  it('does not fire sendEvent when section is not intersecting', () => {
    render(<ScrollTracker section="about-us" />)
    intersectionCallback([{ isIntersecting: false }])
    expect(sendEvent).not.toHaveBeenCalled()
  })

  it('does not fire sendEvent more than once per section', () => {
    render(<ScrollTracker section="about-us" />)
    intersectionCallback([{ isIntersecting: true }])
    intersectionCallback([{ isIntersecting: true }])
    expect(sendEvent).toHaveBeenCalledTimes(1)
  })
})
