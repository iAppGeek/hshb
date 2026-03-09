import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllTimetableSlots: vi.fn(),
  getTimetableByClass: vi.fn(),
  getClassesByTeacher: vi.fn(),
  getAllClasses: vi.fn(),
}))

import { auth } from '@/auth'
import {
  getAllTimetableSlots,
  getClassesByTeacher,
  getTimetableByClass,
  getAllClasses,
} from '@/db'

import TimetablesPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockSlot = {
  id: 'slot-1',
  class_id: 'class-1',
  day_of_week: 'Saturday',
  start_time: '10:00:00',
  end_time: '11:00:00',
  subject: 'Greek Language',
  room: 'R12',
}

describe('TimetablesPage', () => {
  it('renders the Timetables heading', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllTimetableSlots).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await TimetablesPage())
    expect(screen.getByText('Timetables')).toBeTruthy()
  })

  it('shows empty state when no slots exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllTimetableSlots).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await TimetablesPage())
    expect(screen.getByText('No timetable slots found.')).toBeTruthy()
  })

  it('groups slots by day of week', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllTimetableSlots).mockResolvedValue([mockSlot] as any)
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', room_number: 'R12' },
    ] as any)

    render(await TimetablesPage())
    expect(screen.getByText('Saturday')).toBeTruthy()
    expect(screen.getByText('Greek Language')).toBeTruthy()
  })

  it('fetches teacher-specific timetable for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([{ id: 'class-1' }] as any)
    vi.mocked(getTimetableByClass).mockResolvedValue([])

    await TimetablesPage()
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getAllTimetableSlots).not.toHaveBeenCalled()
  })
})
