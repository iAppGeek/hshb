import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import StudentsLoading from './loading'

describe('StudentsLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<StudentsLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders 8 skeleton table rows matching the students table', () => {
    const { container } = render(<StudentsLoading />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(8)
  })

  it('renders 5 skeleton column headers matching the students table columns', () => {
    const { container } = render(<StudentsLoading />)
    const headers = container.querySelectorAll('thead th')
    expect(headers.length).toBe(5)
  })

  it('renders a heading and action button skeleton', () => {
    const { container } = render(<StudentsLoading />)
    // Heading skeleton + Add button skeleton side by side
    const headerRow = container.querySelector('.flex.items-center.justify-between')
    expect(headerRow).toBeTruthy()
  })
})
