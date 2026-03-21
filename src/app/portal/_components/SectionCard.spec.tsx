import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import SectionCard from './SectionCard'

describe('SectionCard', () => {
  it('renders the title', () => {
    render(<SectionCard title="Monday">content</SectionCard>)
    expect(screen.getByRole('heading', { name: 'Monday' })).toBeTruthy()
  })

  it('renders children', () => {
    render(
      <SectionCard title="Section">
        <p>Inner content</p>
      </SectionCard>,
    )
    expect(screen.getByText('Inner content')).toBeTruthy()
  })
})
