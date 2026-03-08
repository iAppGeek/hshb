import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  saveAttendance: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { saveAttendanceAction } from './actions'
import { auth } from '@/auth'
import { saveAttendance } from '@/db'
import { revalidatePath } from 'next/cache'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFormData(fields: Record<string, string | string[]>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(key, v))
    } else {
      fd.append(key, value)
    }
  }
  return fd
}

describe('saveAttendanceAction', () => {
  it('saves attendance records with the current staff id', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(saveAttendance).mockResolvedValue([] as any)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: ['student-1', 'student-2'],
      status_student1: 'present',
      status_student2: 'absent',
    })

    await saveAttendanceAction(fd)

    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({ class_id: 'class-1', date: '2024-03-08', recorded_by: 'staff-1' }),
      expect.objectContaining({ class_id: 'class-1', date: '2024-03-08', recorded_by: 'staff-1' }),
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('defaults missing status to absent', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(saveAttendance).mockResolvedValue([] as any)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
      // no status_student-1 key
    })

    await saveAttendanceAction(fd)

    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({ status: 'absent' }),
    ])
  })

  it('uses null recorded_by when session has no staffId', async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} } as any)
    vi.mocked(saveAttendance).mockResolvedValue([] as any)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
      'status_student-1': 'late',
    })

    await saveAttendanceAction(fd)

    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({ recorded_by: null }),
    ])
  })
})
