'use client'

import { useState, useTransition } from 'react'

import { saveAttendanceAction } from './actions'

type AttendanceStatus = 'present' | 'absent' | 'late'

type Student = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
}

type Props = {
  classId: string
  date: string
  students: Student[]
  existing: Record<string, AttendanceStatus>
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; colour: string }[] = [
  { value: 'present', label: 'Present', colour: 'bg-green-100 text-green-800 ring-green-300' },
  { value: 'late',    label: 'Late',    colour: 'bg-yellow-100 text-yellow-800 ring-yellow-300' },
  { value: 'absent',  label: 'Absent',  colour: 'bg-red-100 text-red-800 ring-red-300' },
]

export default function AttendanceForm({ classId, date, students, existing }: Props) {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    () => {
      const initial: Record<string, AttendanceStatus> = {}
      students.forEach((s) => {
        initial[s.id] = existing[s.id] ?? 'present'
      })
      return initial
    },
  )
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

  const counts = {
    present: Object.values(statuses).filter((s) => s === 'present').length,
    late:    Object.values(statuses).filter((s) => s === 'late').length,
    absent:  Object.values(statuses).filter((s) => s === 'absent').length,
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
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {students.map((student) => {
                  const current = statuses[student.id]
                  return (
                    <tr key={student.id}>
                      {/* Hidden inputs carry the data for the server action */}
                      <input type="hidden" name="studentId" value={student.id} />
                      <input type="hidden" name={`status_${student.id}`} value={current} />

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.last_name}, {student.first_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {student.student_code ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map(({ value, label, colour }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => toggle(student.id, value)}
                              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                                current === value
                                  ? colour
                                  : 'bg-white text-gray-500 ring-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save register'}
            </button>
            {saved && (
              <span className="text-sm text-green-600">Register saved.</span>
            )}
          </div>
        </>
      )}
    </form>
  )
}
