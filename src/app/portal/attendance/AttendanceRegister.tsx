import { getStudentsByClass, getAttendanceByClassAndDate } from '@/db'
import type { AttendanceStatus } from '@/db'
import AttendanceForm from './AttendanceForm'

type Props = {
  classId: string
  date: string
  className: string
}

export default async function AttendanceRegister({ classId, date, className }: Props) {
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
      />
    </>
  )
}
