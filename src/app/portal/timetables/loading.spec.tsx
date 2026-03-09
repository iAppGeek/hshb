import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import TimetablesLoading from './loading'

describe('TimetablesLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<TimetablesLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders 3 day-group skeletons matching the timetable layout', () => {
    const { container } = render(<TimetablesLoading />)
    const dayGroups = container.querySelectorAll('.overflow-hidden.rounded-xl')
    expect(dayGroups.length).toBe(3)
  })

  it('renders 4 column headers per day group', () => {
    const { container } = render(<TimetablesLoading />)
    const allHeaders = container.querySelectorAll('thead th')
    // 3 day groups × 4 columns each
    expect(allHeaders.length).toBe(12)
  })

  it('renders 3 skeleton rows per day group', () => {
    const { container } = render(<TimetablesLoading />)
    const allRows = container.querySelectorAll('tbody tr')
    // 3 day groups × 3 rows each
    expect(allRows.length).toBe(9)
  })
})
