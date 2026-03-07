import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('renders 5 stars by default', () => {
    const { container } = render(<StarRating />)
    expect(container.querySelectorAll('svg')).toHaveLength(5)
  })

  it('renders the specified number of stars', () => {
    const { container } = render(<StarRating rating={3} />)
    expect(container.querySelectorAll('svg')).toHaveLength(3)
  })

  it('renders 1 star when rating is 1', () => {
    const { container } = render(<StarRating rating={1} />)
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('renders the wrapper div', () => {
    const { container } = render(<StarRating />)
    expect(container.querySelector('div')).toHaveClass('flex')
  })
})
