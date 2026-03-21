import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/db', () => ({
  getAllClasses: vi.fn(),
  getAllStaff: vi.fn(),
  getStaffAttendanceByDate: vi.fn(),
  getStaffAttendanceForToday: vi.fn(),
}))

vi.mock('./StaffAttendanceTable', () => ({
  default: vi.fn(() => <div data-testid="staff-table" />),
}))

vi.mock('./utils', () => ({
  fmtTime: vi.fn((ts: string) => ts),
}))

vi.mock('@/components/DatePicker', () => ({
  default: vi.fn(() => <div data-testid="date-picker" />),
}))

vi.mock('./PrintButton', () => ({
  default: vi.fn(() => <button>Print List</button>),
}))

import { auth } from '@/auth'
import {
  getAllClasses,
  getAllStaff,
  getStaffAttendanceByDate,
  getStaffAttendanceForToday,
} from '@/db'

import StaffAttendancePage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

const teacherSession = {
  user: { staffId: 'staff-1', role: 'teacher', name: 'Jane Smith' },
}

const adminSession = {
  user: { staffId: 'admin-1', role: 'admin', name: 'Bob Admin' },
}

const mockStaff = [
  {
    id: 'staff-1',
    first_name: 'Jane',
    last_name: 'Smith',
    display_name: null,
    role: 'teacher',
    email: 'jane@school.com',
    contact_number: null,
    created_at: null,
  },
]

const mockRecord = {
  id: 'sa-1',
  staff_id: 'staff-1',
  date: '2026-03-18',
  signed_in_at: '2026-03-18T09:00:00Z',
  signed_out_at: null,
  created_at: null,
  updated_at: null,
}

function makeSearchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params) as Promise<{ date?: string }>
}

describe('StaffAttendancePage', () => {
  it('redirects to login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(
      StaffAttendancePage({ searchParams: makeSearchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/login')
  })

  describe('teacher view', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(teacherSession as any)
      vi.mocked(getAllClasses).mockResolvedValue([])
    })

    it('renders "Your Attendance Today" heading', async () => {
      vi.mocked(getStaffAttendanceForToday).mockResolvedValue(null)

      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByText('Your Attendance Today')).toBeTruthy()
    })

    it('calls getStaffAttendanceForToday (not getStaffAttendanceByDate)', async () => {
      vi.mocked(getStaffAttendanceForToday).mockResolvedValue(mockRecord)

      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(getStaffAttendanceForToday).toHaveBeenCalledWith(
        'staff-1',
        expect.any(String),
      )
      expect(getStaffAttendanceByDate).not.toHaveBeenCalled()
    })

    it('renders the staff table with the teacher record', async () => {
      vi.mocked(getStaffAttendanceForToday).mockResolvedValue(mockRecord)

      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByTestId('staff-table')).toBeTruthy()
    })

    it('throws if getStaffAttendanceForToday rejects', async () => {
      vi.mocked(getStaffAttendanceForToday).mockRejectedValue(
        new Error('DB error'),
      )

      await expect(
        StaffAttendancePage({ searchParams: makeSearchParams() }),
      ).rejects.toThrow('DB error')
    })
  })

  describe('secretary view', () => {
    const secretarySession = {
      user: { staffId: 'sec-1', role: 'secretary', name: 'Sue Secretary' },
    }

    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(secretarySession as any)
      vi.mocked(getAllStaff).mockResolvedValue(mockStaff as any)
      vi.mocked(getStaffAttendanceByDate).mockResolvedValue([mockRecord])
      vi.mocked(getAllClasses).mockResolvedValue([])
    })

    it('renders Staff Sign-In heading (not teacher view)', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByText('Staff Sign-In')).toBeTruthy()
    })

    it('calls getStaffAttendanceByDate (full staff list, not teacher-only)', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      const today = new Date().toISOString().split('T')[0]
      expect(getStaffAttendanceByDate).toHaveBeenCalledWith(today)
      expect(getStaffAttendanceForToday).not.toHaveBeenCalled()
    })

    it('renders the date picker for secretary', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByTestId('date-picker')).toBeTruthy()
    })
  })

  describe('admin view', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(adminSession as any)
      vi.mocked(getAllStaff).mockResolvedValue(mockStaff as any)
      vi.mocked(getStaffAttendanceByDate).mockResolvedValue([mockRecord])
      vi.mocked(getAllClasses).mockResolvedValue([])
    })

    it('renders Staff Sign-In heading', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByText('Staff Sign-In')).toBeTruthy()
    })

    it('calls getStaffAttendanceByDate with today by default', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      const today = new Date().toISOString().split('T')[0]
      expect(getStaffAttendanceByDate).toHaveBeenCalledWith(today)
      expect(getStaffAttendanceForToday).not.toHaveBeenCalled()
    })

    it('uses the date query param when provided', async () => {
      render(
        await StaffAttendancePage({
          searchParams: makeSearchParams({ date: '2026-01-15' }),
        }),
      )

      expect(getStaffAttendanceByDate).toHaveBeenCalledWith('2026-01-15')
    })

    it('renders the date picker for admin', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByTestId('date-picker')).toBeTruthy()
    })

    it('renders print button for admin', async () => {
      render(await StaffAttendancePage({ searchParams: makeSearchParams() }))

      expect(screen.getByText('Print List')).toBeTruthy()
    })

    it('throws if getAllStaff rejects', async () => {
      vi.mocked(getAllStaff).mockRejectedValue(new Error('Network error'))

      await expect(
        StaffAttendancePage({ searchParams: makeSearchParams() }),
      ).rejects.toThrow('Network error')
    })

    it('throws if getStaffAttendanceByDate rejects', async () => {
      vi.mocked(getStaffAttendanceByDate).mockRejectedValue(
        new Error('DB unavailable'),
      )

      await expect(
        StaffAttendancePage({ searchParams: makeSearchParams() }),
      ).rejects.toThrow('DB unavailable')
    })
  })
})
