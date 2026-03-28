'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import {
  getAttendanceByClassAndDate,
  getClassById,
  getAdminSubscriptions,
  deletePushSubscription,
  saveAttendance,
  logAuditEvent,
} from '@/db'
import { canUpdateAttendance } from '@/lib/permissions'
import { uuid, isoDate, attendanceStatus, optionalString } from '@/lib/schemas'
import type { ActionResult } from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'
import { sendPushNotification } from '@/lib/push'

const attendanceRecordSchema = z.object({
  studentId: uuid,
  status: attendanceStatus,
  notes: optionalString,
})

export async function saveAttendanceAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  const staffId = session?.user?.staffId ?? null

  const classIdRaw = formData.get('classId')
  const dateRaw = formData.get('date')
  const studentIds = formData.getAll('studentId') as string[]

  const classIdParsed = uuid.safeParse(classIdRaw)
  if (!classIdParsed.success) return { error: 'Invalid class ID' }
  const classId = classIdParsed.data

  const dateParsed = isoDate.safeParse(dateRaw)
  if (!dateParsed.success) return { error: 'Invalid date' }
  const date = dateParsed.data

  const parsedRecords = studentIds.map((sid) =>
    attendanceRecordSchema.safeParse({
      studentId: sid,
      status: formData.get(`status_${sid}`) ?? 'absent',
      notes: formData.get(`notes_${sid}`),
    }),
  )

  const failedRecord = parsedRecords.find((r) => !r.success)
  if (failedRecord && !failedRecord.success) {
    return { error: failedRecord.error.issues[0].message }
  }

  const records = parsedRecords.map((r) => {
    const data = (
      r as { success: true; data: z.infer<typeof attendanceRecordSchema> }
    ).data
    return {
      class_id: classId,
      student_id: data.studentId,
      date,
      status: data.status,
      notes: data.notes,
      recorded_by: staffId,
    }
  })

  const existing = await getAttendanceByClassAndDate(classId, date)
  const isUpdate = existing.length > 0

  const role = session?.user?.role as StaffRole
  if (isUpdate && !canUpdateAttendance(role)) {
    return {
      error:
        'You do not have permission to update existing attendance records.',
    }
  }

  await saveAttendance(records)
  logAuditEvent({
    staffId,
    action: isUpdate ? 'update' : 'create',
    entity: 'attendance',
    entityId: classId,
    details: { date, studentCount: records.length },
  })
  revalidatePath('/portal/attendance')

  Promise.all([getClassById(classId), getAdminSubscriptions()])
    .then(([cls, subs]) => {
      const className = cls?.name ?? 'a class'
      const others = subs.filter((sub) => sub.staff_id !== staffId)
      return Promise.allSettled(
        others.map((sub) =>
          sendPushNotification(sub, {
            title: 'Attendance Saved',
            body: `Attendance for ${className} has been ${isUpdate ? 'updated' : 'saved'}`,
            data: { url: '/portal/reports' },
          }).catch((err: unknown) => {
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
    .catch(() => {})
}
