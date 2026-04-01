import BulkEmailDropdown from '@/clientComponents/BulkEmailDropdown'
import { getStudentsByClass, getAttendanceByClassAndDate } from '@/db'
import type { AttendanceStatus } from '@/db'
import { guardianEmailsForMailto, mailtoWithBcc } from '@/lib/mailto'
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

  const today = new Date().toISOString().split('T')[0]
  const dateLabel =
    date === today ? 'Today' : date < today ? 'Historical' : 'Future'

  const attendanceBcc = guardianEmailsForMailto(students)
  const attendanceMailtoHref = mailtoWithBcc(attendanceBcc, {
    subject: `${className} — Attendance ${date}`,
  })

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span>
          {className} &mdash; {date}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${date === today ? 'bg-green-500' : 'bg-amber-500'}`}
        >
          {dateLabel}
        </span>
        {existingRows.length > 0 && (
          <span className="text-green-600">(register already taken)</span>
        )}
        {students.length > 0 && (
          <div className="ml-auto sm:ml-0">
            <BulkEmailDropdown
              emails={attendanceBcc}
              mailtoHref={attendanceMailtoHref}
              buttonLabel="Email class"
              triggerClassName="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition hover:bg-blue-50"
              emptyReason="No guardian email addresses on file for this class."
              mailtoUnavailableReason="Too many addresses for your email app. Use copy instead."
            />
          </div>
        )}
      </div>
      <AttendanceForm
        classId={classId}
        date={date}
        students={students}
        existing={existing}
        role={role}
        hasExisting={existingRows.length > 0}
      />
    </>
  )
}
