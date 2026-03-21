import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import {
  saveAttendance,
  getAttendanceByClassAndDate,
  getClassById,
  getAdminSubscriptions,
  deletePushSubscription,
} from '@/db'
import { sendPushNotification } from '@/lib/push'

import { saveAttendanceAction } from './actions'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  saveAttendance: vi.fn(),
  getAttendanceByClassAndDate: vi.fn(),
  getClassById: vi.fn(),
  getAdminSubscriptions: vi.fn(),
  deletePushSubscription: vi.fn(),
}))

vi.mock('@/lib/push', () => ({
  sendPushNotification: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

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

const mockSub = {
  id: 'sub-1',
  staff_id: 'admin-1',
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  p256dh: 'p256dh-key',
  auth: 'auth-key',
  created_at: null,
}

describe('saveAttendanceAction', () => {
  it('saves attendance records with the current staff id', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: ['student-1', 'student-2'],
      status_student1: 'present',
      status_student2: 'absent',
    })

    await saveAttendanceAction(fd)

    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({
        class_id: 'class-1',
        date: '2024-03-08',
        recorded_by: 'staff-1',
      }),
      expect.objectContaining({
        class_id: 'class-1',
        date: '2024-03-08',
        recorded_by: 'staff-1',
      }),
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('defaults missing status to absent', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)

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
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)

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

  it('dispatches push notifications to admin subscriptions after save', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
      'status_student-1': 'present',
    })

    await saveAttendanceAction(fd)

    // Fire-and-forget — wait a tick for the promise chain to resolve
    await new Promise((r) => setTimeout(r, 0))

    expect(getAdminSubscriptions).toHaveBeenCalled()
    expect(sendPushNotification).toHaveBeenCalledWith(
      mockSub,
      expect.objectContaining({ title: 'Attendance Saved' }),
    )
  })

  it('excludes the submitting staff member from notifications', async () => {
    const submitterSub = { ...mockSub, staff_id: 'staff-1' }
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([submitterSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
    })

    await saveAttendanceAction(fd)
    await new Promise((r) => setTimeout(r, 0))

    expect(sendPushNotification).not.toHaveBeenCalled()
  })

  it('sends "updated" in body when attendance already exists', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: 'staff-1', role: 'teacher' },
    } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1' },
    ] as any)
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
    })

    await saveAttendanceAction(fd)
    await new Promise((r) => setTimeout(r, 0))

    expect(sendPushNotification).toHaveBeenCalledWith(
      mockSub,
      expect.objectContaining({ body: expect.stringContaining('updated') }),
    )
  })

  it('auto-deletes stale subscription on 410 push error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(deletePushSubscription).mockResolvedValue(undefined)
    const goneError = Object.assign(new Error('Gone'), { statusCode: 410 })
    vi.mocked(sendPushNotification).mockRejectedValue(goneError)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
    })

    await saveAttendanceAction(fd)
    await new Promise((r) => setTimeout(r, 0))

    expect(deletePushSubscription).toHaveBeenCalledWith(mockSub.endpoint)
  })

  it('swallows non-410 push errors without throwing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockRejectedValue(
      new Error('Network error'),
    )

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
    })

    await expect(saveAttendanceAction(fd)).resolves.toBeUndefined()
  })

  it('still calls revalidatePath even when push dispatch is involved', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
    })

    await saveAttendanceAction(fd)
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('allows secretary to save new attendance (no existing records)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: 'secretary-1', role: 'secretary' },
    } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: 'class-1',
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
      'status_student-1': 'present',
    })

    const result = await saveAttendanceAction(fd)

    expect(result).toBeUndefined()
    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({
        class_id: 'class-1',
        date: '2024-03-08',
        recorded_by: 'secretary-1',
      }),
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('blocks secretary from updating existing attendance records', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: 'secretary-1', role: 'secretary' },
    } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1' },
    ] as any)

    const fd = makeFormData({
      classId: 'class-1',
      date: '2024-03-08',
      studentId: 'student-1',
      'status_student-1': 'present',
    })

    const result = await saveAttendanceAction(fd)

    expect(result).toEqual({
      error:
        'You do not have permission to update existing attendance records.',
    })
    expect(saveAttendance).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
