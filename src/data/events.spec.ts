import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

import { sendEvent } from './events'
import { sendGAEvent } from '@next/third-parties/google'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('sendEvent', () => {
  it('calls sendGAEvent with the correct arguments', () => {
    sendEvent('click', 'button-pressed', { id: 1 })
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'click', {
      actionName: 'button-pressed',
      data: { id: 1 },
    })
  })

  it('calls sendGAEvent once per invocation', () => {
    sendEvent('view', 'page-view', null)
    expect(sendGAEvent).toHaveBeenCalledTimes(1)
  })

  it('passes data as-is to sendGAEvent', () => {
    const data = 'some string data'
    sendEvent('submit', 'form-submit', data)
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'submit', {
      actionName: 'form-submit',
      data,
    })
  })
})
