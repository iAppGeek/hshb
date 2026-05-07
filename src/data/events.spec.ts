import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendGAEvent } from '@next/third-parties/google'

import { sendEvent } from './events'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('sendEvent', () => {
  it('does not call sendGAEvent outside production', () => {
    sendEvent('click', 'button-pressed', { id: 1 })
    expect(sendGAEvent).not.toHaveBeenCalled()
  })

  describe('in production', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('calls sendGAEvent once per invocation', () => {
      sendEvent('view', 'page-view')
      expect(sendGAEvent).toHaveBeenCalledTimes(1)
    })

    it('uses actionType as the GA event name', () => {
      sendEvent('submit', 'form-submit')
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'submit', {
        action_name: 'form-submit',
      })
    })

    it('passes string data as a label param', () => {
      sendEvent('click', 'navigation', 'about-us')
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'click', {
        action_name: 'navigation',
        label: 'about-us',
      })
    })

    it('spreads object data as flat GA params', () => {
      sendEvent('scroll', 'section-view', { section: 'events' })
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'scroll', {
        action_name: 'section-view',
        section: 'events',
      })
    })

    it('sends only action_name when data is null', () => {
      sendEvent('view', 'page-view', null)
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'view', {
        action_name: 'page-view',
      })
    })

    it('sends only action_name when data is undefined', () => {
      sendEvent('view', 'calendar-scrolled-into-view')
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'view', {
        action_name: 'calendar-scrolled-into-view',
      })
    })
  })
})
