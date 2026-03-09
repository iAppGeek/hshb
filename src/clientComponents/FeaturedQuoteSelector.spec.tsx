import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

vi.mock('@/data/contentful')
vi.mock('@/data/numbers', () => ({
  getRandomInt: vi.fn(() => 0),
}))

import { getRandomInt } from '@/data/numbers'

import { FeaturedQuoteSelector } from './FeaturedQuoteSelector'

const mockQuotes = [
  { text: 'First quote', author: 'Alice', role: 'Parent' },
  { text: 'Second quote', author: 'Bob', role: 'Teacher' },
  { text: 'Third quote', author: 'Carol', role: 'Student' },
]

beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(getRandomInt).mockReturnValue(0)
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('FeaturedQuoteSelector', () => {
  it('renders the quote at the index returned by getRandomInt', () => {
    vi.mocked(getRandomInt).mockReturnValue(1)
    render(<FeaturedQuoteSelector items={mockQuotes} />)

    expect(screen.getByText('Second quote')).toBeTruthy()
    expect(screen.getByText('Bob')).toBeTruthy()
    expect(screen.getByText('Teacher')).toBeTruthy()
  })

  it('renders the first quote when getRandomInt returns 0', () => {
    vi.mocked(getRandomInt).mockReturnValue(0)
    render(<FeaturedQuoteSelector items={mockQuotes} />)

    expect(screen.getByText('First quote')).toBeTruthy()
  })

  it('changes quote after 20 seconds interval', () => {
    let callCount = 0
    vi.mocked(getRandomInt).mockImplementation(() => {
      return callCount++ === 0 ? 0 : 2
    })

    render(<FeaturedQuoteSelector items={mockQuotes} />)
    expect(screen.getByText('First quote')).toBeTruthy()

    act(() => {
      vi.advanceTimersByTime(20_000)
    })

    expect(screen.getByText('Third quote')).toBeTruthy()
  })

  it('clears interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<FeaturedQuoteSelector items={mockQuotes} />)
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
