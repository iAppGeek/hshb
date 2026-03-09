import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import ReportsLoading from './loading'

describe('ReportsLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<ReportsLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders 4 summary stat card skeletons', () => {
    const { container } = render(<ReportsLoading />)
    const statCards = container.querySelectorAll('.rounded-xl.bg-white.p-6')
    expect(statCards.length).toBe(4)
  })

  it('renders 5 skeleton rows in the enrolment table', () => {
    const { container } = render(<ReportsLoading />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(5)
  })

  it('renders the enrolment table skeleton with 3 column headers', () => {
    const { container } = render(<ReportsLoading />)
    const headers = container.querySelectorAll('thead th')
    expect(headers.length).toBe(3)
  })
})
