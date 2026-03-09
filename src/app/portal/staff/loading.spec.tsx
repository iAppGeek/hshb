import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import StaffLoading from './loading'

describe('StaffLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<StaffLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders 7 skeleton column headers matching the staff table columns', () => {
    const { container } = render(<StaffLoading />)
    const headers = container.querySelectorAll('thead th')
    expect(headers.length).toBe(7)
  })

  it('renders 6 skeleton table rows', () => {
    const { container } = render(<StaffLoading />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(6)
  })
})
