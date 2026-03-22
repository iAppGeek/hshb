import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import ReportsLoading from './loading'

describe('ReportsLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<ReportsLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders 3 summary stat card skeletons', () => {
    const { container } = render(<ReportsLoading />)
    const statCards = container.querySelectorAll('.rounded-xl.bg-white.p-6')
    expect(statCards.length).toBe(3)
  })

  it('renders 5 skeleton rows in the table', () => {
    const { container } = render(<ReportsLoading />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(5)
  })

  it('renders the table skeleton with 4 column headers', () => {
    const { container } = render(<ReportsLoading />)
    const headers = container.querySelectorAll('thead th')
    expect(headers.length).toBe(4)
  })

  it('renders 3 mode selector skeleton buttons', () => {
    const { container } = render(<ReportsLoading />)
    const modeButtons = container.querySelectorAll('.rounded-lg.bg-gray-200')
    expect(modeButtons.length).toBe(4) // 3 mode buttons + 1 date input skeleton
  })
})
