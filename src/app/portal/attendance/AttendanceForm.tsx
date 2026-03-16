'use client'

import { useState, useTransition } from 'react'

import StudentDetailsModal, {
  type StudentForModal,
} from '@/components/StudentDetailsModal'
import type { StaffRole } from '@/types/next-auth'

import { saveAttendanceAction } from './actions'

type AttendanceStatus = 'present' | 'absent' | 'late'

type Student = StudentForModal & {
  student_code: string | null
}

type Props = {
  classId: string
  date: string
  students: Student[]
  existing: Record<string, AttendanceStatus>
  role: StaffRole
}

export default function AttendanceForm({
  classId,
  date,
  students,
  existing,
  role,
}: Props) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [statuses, setStatuses] = useState<
    Record<string, AttendanceStatus | null>
  >(() => {
    const initial: Record<string, AttendanceStatus | null> = {}
    students.forEach((s) => {
      initial[s.id] = existing[s.id] ?? null
    })
    return initial
  })
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggle(studentId: string, status: AttendanceStatus) {
    setSaved(false)
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    startTransition(async () => {
      await saveAttendanceAction(new FormData(form))
      setSaved(true)
    })
  }

  const allSelected = students.every((s) => statuses[s.id] !== null)

  const counts = {
    present: Object.values(statuses).filter((s) => s === 'present').length,
    late: Object.values(statuses).filter((s) => s === 'late').length,
    absent: Object.values(statuses).filter((s) => s === 'absent').length,
    unset: Object.values(statuses).filter((s) => s === null).length,
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="date" value={date} />

      {students.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No students in this class.</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="mb-4 flex gap-4 text-sm">
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800">
              {counts.present} present
            </span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-800">
              {counts.late} late
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              {counts.absent} absent
            </span>
            {counts.unset > 0 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-500">
                {counts.unset} unmarked
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right sm:w-full">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {students.map((student) => {
                    const current = statuses[student.id]
                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 sm:whitespace-nowrap">
                          {/* Hidden inputs carry the data for the server action */}
                          <input
                            type="hidden"
                            name="studentId"
                            value={student.id}
                          />
                          {current !== null && (
                            <input
                              type="hidden"
                              name={`status_${student.id}`}
                              value={current}
                            />
                          )}
                          {student.last_name}, {student.first_name}
                        </td>

                        <td className="w-px px-6 py-4 whitespace-nowrap">
                          <div className="flex overflow-hidden rounded-full ring-1 ring-gray-200">
                            <button
                              type="button"
                              onClick={() => toggle(student.id, 'present')}
                              className={`px-4 py-2 text-sm font-medium transition ${
                                current === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-white text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sm:hidden">P</span>
                              <span className="hidden sm:block">Present</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggle(student.id, 'late')}
                              className={`border-x border-gray-200 px-4 py-2 text-sm font-medium transition ${
                                current === 'late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-white text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sm:hidden">L</span>
                              <span className="hidden sm:block">Late</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggle(student.id, 'absent')}
                              className={`px-4 py-2 text-sm font-medium transition ${
                                current === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-white text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sm:hidden">A</span>
                              <span className="hidden sm:block">Absent</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(student)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span
              title={
                !allSelected
                  ? `${counts.unset} student${counts.unset === 1 ? '' : 's'} still unmarked`
                  : undefined
              }
              className={!allSelected ? 'cursor-not-allowed' : undefined}
            >
              <button
                type="submit"
                disabled={isPending || !allSelected}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save register'}
              </button>
            </span>
            {saved && (
              <span className="text-sm text-green-600">Register saved.</span>
            )}
          </div>
        </>
      )}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          role={role}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </form>
  )
}
