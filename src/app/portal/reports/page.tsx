import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import DatePicker from '@/components/DatePicker'
import {
  getStudentCount,
  getEnrollmentCountsByClass,
  getAllClasses,
  getAllStaff,
  getAttendanceSummaryByDate,
  getAttendanceLateCount,
  getStaffSignedInCount,
} from '@/db'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await auth()
  const role = session?.user?.role
  if (!session || (role !== 'admin' && role !== 'headteacher')) {
    redirect('/portal/dashboard')
  }

  const today = new Date().toISOString().split('T')[0]
  const { date: qDate } = await searchParams
  const selectedDate = qDate ?? today

  const [
    activeStudentCount,
    enrollmentCounts,
    classes,
    staff,
    attendanceSummary,
    staffSignedInCount,
    lateCount,
  ] = await Promise.all([
    getStudentCount(),
    getEnrollmentCountsByClass(),
    getAllClasses(),
    getAllStaff(),
    getAttendanceSummaryByDate(selectedDate),
    getStaffSignedInCount(selectedDate),
    getAttendanceLateCount(selectedDate),
  ])

  const teachingStaff = staff.filter(
    (s) => s.role === 'teacher' || s.role === 'headteacher',
  )

  const presentToday = Object.values(attendanceSummary).reduce(
    (sum, s) => sum + s.presentCount,
    0,
  )

  const fmt = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })

  const enrolmentByClass = classes.map((cls) => {
    const summary = attendanceSummary[cls.id]
    const enrolled = enrollmentCounts[cls.id] ?? 0
    return {
      name: cls.name,
      enrolled,
      presentCount: summary?.presentCount ?? null,
      attendanceCreatedAt: summary ? fmt(summary.createdAt) : null,
      attendanceUpdatedAt: summary ? fmt(summary.updatedAt) : null,
    }
  })

  const pct = (n: number, total: number) =>
    total > 0 ? `${Math.round((n / total) * 100)}%` : '—'

  const stats = [
    {
      label: 'Staff signed in',
      value: `${staffSignedInCount}/${teachingStaff.length}`,
      sub: pct(staffSignedInCount, teachingStaff.length),
    },
    {
      label: 'Students attendance',
      value: `${presentToday}/${activeStudentCount}`,
      sub: pct(presentToday, activeStudentCount),
    },
    {
      label: 'Students late',
      value: lateCount,
      sub: null,
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-gray-500">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString(
                'en-GB',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                },
              )}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium text-white print:hidden ${selectedDate === today ? 'bg-green-500' : 'bg-amber-500'}`}
            >
              {selectedDate === today
                ? 'Today'
                : selectedDate < today
                  ? 'Historical'
                  : 'Future'}
            </span>
          </div>
        </div>
        <div className="print:hidden">
          <DatePicker selectedDate={selectedDate} basePath="/portal/reports" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">{value}</span>
              {sub && (
                <span className="text-sm font-medium text-gray-500">{sub}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Enrolment by class */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Attendance by Class
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Record Times
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrolmentByClass.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {row.presentCount !== null
                      ? `${row.presentCount}/${row.enrolled}`
                      : `—/${row.enrolled}`}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {row.attendanceCreatedAt ? (
                      <div className="flex flex-col gap-0.5">
                        <span>Created: {row.attendanceCreatedAt}</span>
                        <span>Updated: {row.attendanceUpdatedAt}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-amber-600">
                        Not Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
