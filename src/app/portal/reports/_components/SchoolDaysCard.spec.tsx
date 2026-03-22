import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SchoolDaysCard from './SchoolDaysCard'

const dates = [
  { date: '2026-03-04', staffCount: 3, attendanceCount: 2 },
  { date: '2026-03-07', staffCount: 1, attendanceCount: 4 },
  { date: '2026-03-11', staffCount: 2, attendanceCount: 0 },
]

describe('SchoolDaysCard', () => {
  it('renders the school days count', () => {
    render(<SchoolDaysCard totalSchoolDays={3} dates={dates} />)
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText('School days')).toBeTruthy()
  })

  it('shows "View dates" hint and tooltip', () => {
    render(<SchoolDaysCard totalSchoolDays={3} dates={dates} />)
    expect(screen.getByText('View dates')).toBeTruthy()
    expect(screen.getByRole('tooltip')).toBeTruthy()
    expect(
      screen.getByText('Dates where attendance was taken or staff signed in'),
    ).toBeTruthy()
  })

  it('opens modal on click and shows dates with record counts', async () => {
    const user = userEvent.setup()
    render(<SchoolDaysCard totalSchoolDays={3} dates={dates} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('School Days (3)')).toBeTruthy()
    expect(screen.getByText('Wed 4 Mar')).toBeTruthy()
    expect(screen.getByText('Sat 7 Mar')).toBeTruthy()
    expect(screen.getByText('Wed 11 Mar')).toBeTruthy()
    // Record counts shown as (N) with tooltips
    expect(screen.getAllByText('(3)')).toHaveLength(1) // staffCount=3 for first date
    expect(screen.getByText('(1)')).toBeTruthy() // staffCount=1 for second date
    expect(screen.getAllByText('(2)')).toHaveLength(2) // staffCount=2 + attendanceCount=2
    expect(screen.getByText('(4)')).toBeTruthy() // attendanceCount=4 for second date
    expect(screen.getByText('(0)')).toBeTruthy() // attendanceCount=0 for third date
    // Tooltips exist for each count type
    expect(screen.getAllByText('Staff sign-in records')).toHaveLength(3)
    expect(screen.getAllByText('Attendance records')).toHaveLength(3)
  })

  it('closes modal on close button click', async () => {
    const user = userEvent.setup()
    render(<SchoolDaysCard totalSchoolDays={3} dates={dates} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('School Days (3)')).toBeTruthy()
    // Click the X button (second button in the DOM after the card button)
    const closeBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('svg'))!
    await user.click(closeBtn)
    expect(screen.queryByText('School Days (3)')).toBeNull()
  })
})
