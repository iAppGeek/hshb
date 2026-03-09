import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import AttendanceLoading from './loading'

describe('AttendanceLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<AttendanceLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders a filter area skeleton for class and date controls', () => {
    const { container } = render(<AttendanceLoading />)
    // Two filter groups: class selector and date picker
    const filterGroups = container.querySelectorAll('.mb-6.flex.flex-col > div')
    expect(filterGroups.length).toBe(2)
  })

  it('renders 8 skeleton rows for the register grid', () => {
    const { container } = render(<AttendanceLoading />)
    // Each row: student name placeholder + 3 status button placeholders
    const rows = container.querySelectorAll(
      '.flex.items-center.justify-between',
    )
    expect(rows.length).toBe(8)
  })

  it('renders the register grid skeleton below the filters', () => {
    const { container } = render(<AttendanceLoading />)
    const grid = container.querySelector('.overflow-hidden.rounded-xl')
    expect(grid).toBeTruthy()
  })
})
