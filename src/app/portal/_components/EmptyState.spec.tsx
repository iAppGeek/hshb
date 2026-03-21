import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders the message', () => {
    render(<EmptyState message="No items found." />)
    expect(screen.getByText('No items found.')).toBeTruthy()
  })

  it('renders different messages', () => {
    render(<EmptyState message="No staff found." />)
    expect(screen.getByText('No staff found.')).toBeTruthy()
  })
})
