import { type Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import {
  getAllClasses,
  getClassesByTeacher,
  getStudentsByClass,
  getAttendanceByClassAndDate,
} from '@/db'
import type { StaffRole } from '@/types/next-auth'
import type { AttendanceStatus } from '@/db'
import AttendanceForm from './AttendanceForm'

export const metadata: Metadata = { title: 'Attendance' }

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>
}) {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId!

  const { classId: qClassId, date: qDate } = await searchParams

  const today = new Date().toISOString().split('T')[0]
  const selectedDate = qDate ?? today

  const classes =
    role === 'teacher'
      ? await getClassesByTeacher(staffId)
      : await getAllClasses()

  const selectedClassId = qClassId ?? classes[0]?.id ?? null

  const students = selectedClassId ? await getStudentsByClass(selectedClassId) : []

  const existingRows = selectedClassId
    ? await getAttendanceByClassAndDate(selectedClassId, selectedDate)
    : []

  const existing: Record<string, AttendanceStatus> = {}
  for (const row of existingRows) {
    existing[row.student_id] = row.status as AttendanceStatus
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No classes assigned.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            {/* Class selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Class
              </label>
              <div className="flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/portal/attendance?classId=${cls.id}&date=${selectedDate}`}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      cls.id === selectedClassId
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cls.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label
                htmlFor="date-picker"
                className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide"
              >
                Date
              </label>
              <form method="get" action="/portal/attendance">
                {selectedClassId && (
                  <input type="hidden" name="classId" value={selectedClassId} />
                )}
                <div className="flex gap-2">
                  <input
                    id="date-picker"
                    type="date"
                    name="date"
                    defaultValue={selectedDate}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 shadow-sm transition hover:bg-gray-50"
                  >
                    Load
                  </button>
                </div>
              </form>
            </div>
          </div>

          {selectedClass && (
            <p className="mb-4 text-sm text-gray-500">
              {selectedClass.name} &mdash; {selectedDate}
              {existingRows.length > 0 && (
                <span className="ml-2 text-green-600">(register already taken)</span>
              )}
            </p>
          )}

          {selectedClassId && (
            <AttendanceForm
              classId={selectedClassId}
              date={selectedDate}
              students={students}
              existing={existing}
            />
          )}
        </>
      )}
    </div>
  )
}
