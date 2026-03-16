'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import {
  getAttendanceByClassAndDate,
  getClassById,
  getAdminSubscriptions,
  deletePushSubscription,
  saveAttendance,
} from '@/db'
import type { AttendanceStatus } from '@/db'
import { sendPushNotification } from '@/lib/push'

export async function saveAttendanceAction(formData: FormData) {
  const session = await auth()
  const staffId = session?.user?.staffId ?? null

  const classId = formData.get('classId') as string
  const date = formData.get('date') as string
  const studentIds = formData.getAll('studentId') as string[]

  const records = studentIds.map((studentId) => ({
    class_id: classId,
    student_id: studentId,
    date,
    status: (formData.get(`status_${studentId}`) ??
      'absent') as AttendanceStatus,
    notes: (formData.get(`notes_${studentId}`) as string) || null,
    recorded_by: staffId,
  }))

  // Check before save — after upsert records always exist, so we can't detect updates afterwards
  const existing = await getAttendanceByClassAndDate(classId, date)
  const isUpdate = existing.length > 0

  await saveAttendance(records)
  revalidatePath('/portal/attendance')

  // Fire-and-forget: fetch class name and admin subscriptions in parallel
  Promise.all([getClassById(classId), getAdminSubscriptions()])
    .then(([cls, subs]) => {
      const className = cls?.name ?? 'a class'
      // Exclude the staff member who submitted — they don't need to notify themselves
      const others = subs.filter((sub) => sub.staff_id !== staffId)
      return Promise.allSettled(
        others.map((sub) =>
          sendPushNotification(sub, {
            title: 'Attendance Saved',
            body: `Attendance for ${className} has been ${isUpdate ? 'updated' : 'saved'}`,
            data: { url: '/portal/reports' },
          }).catch((err: unknown) => {
            // 410 Gone = user deleted the PWA or cleared browser data — auto-cleanup stale row
            if (
              err instanceof Error &&
              'statusCode' in err &&
              (err as { statusCode: number }).statusCode === 410
            ) {
              return deletePushSubscription(sub.endpoint)
            }
          }),
        ),
      )
    })
    .catch(() => {}) // push failures must never surface to the teacher
}
