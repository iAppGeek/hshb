import { getStudentsByClass, getAttendanceByClassAndDate } from '@/db'
import type { AttendanceStatus } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import AttendanceForm from './AttendanceForm'

type Props = {
  classId: string
  date: string
  className: string
  role: StaffRole
}

export default async function AttendanceRegister({
  classId,
  date,
  className,
  role,
}: Props) {
  const [students, existingRows] = await Promise.all([
    getStudentsByClass(classId),
    getAttendanceByClassAndDate(classId, date),
  ])

  const existing: Record<string, AttendanceStatus> = {}
  for (const row of existingRows) {
    existing[row.student_id] = row.status as AttendanceStatus
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        {className} &mdash; {date}
        {existingRows.length > 0 && (
          <span className="ml-2 text-green-600">(register already taken)</span>
        )}
      </p>
      <AttendanceForm
        classId={classId}
        date={date}
        students={students}
        existing={existing}
        role={role}
      />
    </>
  )
}
