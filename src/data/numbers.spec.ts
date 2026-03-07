import { describe, it, expect, vi, afterEach } from 'vitest'

import { getRandomInt } from './numbers'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getRandomInt', () => {
  it('returns floor of random * max', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(getRandomInt(10)).toBe(5)
  })

  it('returns 0 when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomInt(10)).toBe(0)
  })

  it('returns max - 1 when random is just below 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    expect(getRandomInt(10)).toBe(9)
  })

  it('returns 0 when max is 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    expect(getRandomInt(1)).toBe(0)
  })

  it('always returns an integer', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.7)
    const result = getRandomInt(7)
    expect(Number.isInteger(result)).toBe(true)
  })
})
