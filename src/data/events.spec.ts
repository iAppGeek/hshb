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

    it('calls sendGAEvent with action_name as a flat param', () => {
      sendEvent('click', 'button-pressed', { id: 1 })
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'click', {
        action_name: 'button-pressed',
      })
    })

    it('calls sendGAEvent once per invocation', () => {
      sendEvent('view', 'page-view', null)
      expect(sendGAEvent).toHaveBeenCalledTimes(1)
    })

    it('uses actionType as the GA event name', () => {
      sendEvent('submit', 'form-submit', 'some data')
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'submit', {
        action_name: 'form-submit',
      })
    })
  })
})
