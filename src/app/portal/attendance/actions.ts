'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { saveAttendance } from '@/db'
import type { AttendanceStatus } from '@/db'

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

  await saveAttendance(records)
  revalidatePath('/portal/attendance')
}
