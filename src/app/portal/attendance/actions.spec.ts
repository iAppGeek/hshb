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
  logAuditEvent: vi.fn(),
}))

vi.mock('@/lib/push', () => ({
  sendPushNotification: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const CLASS_ID = '00000000-0000-4000-8000-000000000001'
const STUDENT_1 = '00000000-0000-4000-8000-000000000010'
const STUDENT_2 = '00000000-0000-4000-8000-000000000020'
const STAFF_ID = '00000000-0000-4000-8000-000000000100'
const SECRETARY_ID = '00000000-0000-4000-8000-000000000200'
const ADMIN_ID = '00000000-0000-4000-8000-000000000300'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFormData(fields: Record<string, string | string[]>): FormData {
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
  staff_id: ADMIN_ID,
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  p256dh: 'p256dh-key',
  auth: 'auth-key',
  created_at: null,
}

describe('saveAttendanceAction', () => {
  it('saves attendance records with the current staff id', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: [STUDENT_1, STUDENT_2],
      [`status_${STUDENT_1}`]: 'present',
      [`status_${STUDENT_2}`]: 'absent',
    })

    await saveAttendanceAction(fd)

    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({
        class_id: CLASS_ID,
        date: '2024-03-08',
        recorded_by: STAFF_ID,
      }),
      expect.objectContaining({
        class_id: CLASS_ID,
        date: '2024-03-08',
        recorded_by: STAFF_ID,
      }),
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('defaults missing status to absent', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
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
      id: CLASS_ID,
      name: 'Class A',
    } as any)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
      [`status_${STUDENT_1}`]: 'late',
    })

    await saveAttendanceAction(fd)

    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({ recorded_by: null }),
    ])
  })

  it('dispatches push notifications to admin subscriptions after save', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
      [`status_${STUDENT_1}`]: 'present',
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
    const submitterSub = { ...mockSub, staff_id: STAFF_ID }
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([submitterSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
    })

    await saveAttendanceAction(fd)
    await new Promise((r) => setTimeout(r, 0))

    expect(sendPushNotification).not.toHaveBeenCalled()
  })

  it('sends "updated" in body when attendance already exists', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: STAFF_ID, role: 'teacher' },
    } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1' },
    ] as any)
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
    })

    await saveAttendanceAction(fd)
    await new Promise((r) => setTimeout(r, 0))

    expect(sendPushNotification).toHaveBeenCalledWith(
      mockSub,
      expect.objectContaining({ body: expect.stringContaining('updated') }),
    )
  })

  it('auto-deletes stale subscription on 410 push error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(deletePushSubscription).mockResolvedValue(undefined)
    const goneError = Object.assign(new Error('Gone'), { statusCode: 410 })
    vi.mocked(sendPushNotification).mockRejectedValue(goneError)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
    })

    await saveAttendanceAction(fd)
    await new Promise((r) => setTimeout(r, 0))

    expect(deletePushSubscription).toHaveBeenCalledWith(mockSub.endpoint)
  })

  it('swallows non-410 push errors without throwing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockRejectedValue(
      new Error('Network error'),
    )

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
    })

    await expect(saveAttendanceAction(fd)).resolves.toBeUndefined()
  })

  it('still calls revalidatePath even when push dispatch is involved', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: STAFF_ID } } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([mockSub])
    vi.mocked(sendPushNotification).mockResolvedValue(undefined)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
    })

    await saveAttendanceAction(fd)
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('allows secretary to save new attendance (no existing records)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: SECRETARY_ID, role: 'secretary' },
    } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])
    vi.mocked(saveAttendance).mockResolvedValue([] as any)
    vi.mocked(getClassById).mockResolvedValue({
      id: CLASS_ID,
      name: 'Class A',
    } as any)
    vi.mocked(getAdminSubscriptions).mockResolvedValue([])

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
      [`status_${STUDENT_1}`]: 'present',
    })

    const result = await saveAttendanceAction(fd)

    expect(result).toBeUndefined()
    expect(saveAttendance).toHaveBeenCalledWith([
      expect.objectContaining({
        class_id: CLASS_ID,
        date: '2024-03-08',
        recorded_by: SECRETARY_ID,
      }),
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/attendance')
  })

  it('blocks secretary from updating existing attendance records', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: SECRETARY_ID, role: 'secretary' },
    } as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1' },
    ] as any)

    const fd = makeFormData({
      classId: CLASS_ID,
      date: '2024-03-08',
      studentId: STUDENT_1,
      [`status_${STUDENT_1}`]: 'present',
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
