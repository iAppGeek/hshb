import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { auth } from '@/auth'
import {
  getAllStudents,
  getAllClasses,
  getAllStaff,
  getAttendanceLastUpdatedPerClass,
} from '@/db'

import ReportsPage from './page'
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/db', () => ({
  getAllStudents: vi.fn(),
  getAllClasses: vi.fn(),
  getAllStaff: vi.fn(),
  getAttendanceLastUpdatedPerClass: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
  vi.mocked(getAttendanceLastUpdatedPerClass).mockResolvedValue({})
})

const makeStudents = (count: number, active = true) =>
  Array.from({ length: count }, (_, i) => ({
    id: `student-${i}`,
    active,
    student_classes: [
      { class: { id: 'class-1', name: 'Year 3A', year_group: '3' } },
    ],
    allergies: i === 0 ? 'Nuts' : null,
  }))

describe('ReportsPage', () => {
  it('redirects to dashboard when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(ReportsPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/dashboard',
    )
  })

  it('redirects to dashboard when role is teacher', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)

    await expect(ReportsPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/dashboard',
    )
  })

  it('renders the Reports & Analytics heading', async () => {
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])
    vi.mocked(getAllStaff).mockResolvedValue([])

    render(await ReportsPage())
    expect(screen.getByText('Reports & Analytics')).toBeTruthy()
  })

  it('displays correct total active student count', async () => {
    vi.mocked(getAllStudents).mockResolvedValue(makeStudents(5) as any)
    vi.mocked(getAllClasses).mockResolvedValue([])
    vi.mocked(getAllStaff).mockResolvedValue([])

    render(await ReportsPage())
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('counts students with allergies correctly', async () => {
    vi.mocked(getAllStudents).mockResolvedValue(makeStudents(3) as any)
    vi.mocked(getAllClasses).mockResolvedValue([])
    vi.mocked(getAllStaff).mockResolvedValue([])

    render(await ReportsPage())
    expect(screen.getByText('Students with allergies')).toBeTruthy()
  })

  it('renders enrolment by class table', async () => {
    vi.mocked(getAllStudents).mockResolvedValue(makeStudents(2) as any)
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getAllStaff).mockResolvedValue([])

    render(await ReportsPage())
    expect(screen.getByText('Year 3A')).toBeTruthy()
    expect(screen.getByText('Enrolment by Class')).toBeTruthy()
  })

  it('counts only teaching staff in the teachers stat', async () => {
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])
    vi.mocked(getAllStaff).mockResolvedValue([
      { id: 'staff-1', role: 'teacher' },
      { id: 'staff-2', role: 'admin' },
      { id: 'staff-3', role: 'teacher' },
    ] as any)

    render(await ReportsPage())
    expect(screen.getByText('Teaching staff')).toBeTruthy()
  })

  it('shows Not Completed when no attendance for a class today', async () => {
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getAllStaff).mockResolvedValue([])
    vi.mocked(getAttendanceLastUpdatedPerClass).mockResolvedValue({})

    render(await ReportsPage())
    expect(screen.getByText('Not Completed')).toBeTruthy()
  })

  it('shows last updated time when attendance exists for a class today', async () => {
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getAllStaff).mockResolvedValue([])
    vi.mocked(getAttendanceLastUpdatedPerClass).mockResolvedValue({
      'class-1': '2024-03-08T09:30:00Z',
    })

    render(await ReportsPage())
    expect(screen.getByText(/Last updated/)).toBeTruthy()
  })
})
