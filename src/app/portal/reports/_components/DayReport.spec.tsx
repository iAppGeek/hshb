import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import DayReport from './DayReport'

const defaultStats = [
  { label: 'Staff signed in', value: '3/5', sub: '60%' },
  { label: 'Students attendance', value: '8/10', sub: '80%' },
  { label: 'Students late', value: 2, sub: null },
]

const defaultClasses = [
  {
    name: 'Year 3A',
    enrolled: 10,
    presentCount: 8,
    attendanceCreatedAt: '09:00',
    attendanceUpdatedAt: '09:30',
  },
  {
    name: 'Year 4B',
    enrolled: 12,
    presentCount: null,
    attendanceCreatedAt: null,
    attendanceUpdatedAt: null,
  },
]

describe('DayReport', () => {
  it('renders summary stat cards', () => {
    render(<DayReport stats={defaultStats} enrolmentByClass={defaultClasses} />)
    expect(screen.getByText('Staff signed in')).toBeTruthy()
    expect(screen.getByText('3/5')).toBeTruthy()
    expect(screen.getByText('60%')).toBeTruthy()
    expect(screen.getAllByText('8/10')).toHaveLength(2) // stat card + table
    expect(screen.getByText('Students late')).toBeTruthy()
  })

  it('renders Attendance by Class table', () => {
    render(<DayReport stats={defaultStats} enrolmentByClass={defaultClasses} />)
    expect(screen.getByText('Attendance by Class')).toBeTruthy()
    expect(screen.getByText('Year 3A')).toBeTruthy()
    expect(screen.getByText('Year 4B')).toBeTruthy()
  })

  it('shows Not Completed when no attendance data', () => {
    render(<DayReport stats={defaultStats} enrolmentByClass={defaultClasses} />)
    expect(screen.getByText('Not Completed')).toBeTruthy()
  })

  it('shows record times when attendance exists', () => {
    render(<DayReport stats={defaultStats} enrolmentByClass={defaultClasses} />)
    expect(screen.getByText('Created: 09:00')).toBeTruthy()
    expect(screen.getByText('Updated: 09:30')).toBeTruthy()
  })
})
