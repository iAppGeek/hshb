import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import {
  getAllClasses,
  getAllStaff,
  getStaffAttendanceByDate,
  getStaffAttendanceForToday,
} from '@/db'
import type { StaffRole } from '@/types/next-auth'

import DatePicker from './DatePicker'
import PrintButton from './PrintButton'
import StaffAttendanceTable from './StaffAttendanceTable'
import { fmtTime } from './utils'

export const metadata: Metadata = { title: 'Staff Sign-In' }

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/portal/login')

  const role = session.user?.role as StaffRole
  const staffId = session.user?.staffId ?? ''

  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  if (role === 'teacher') {
    // Teachers always see today only, for themselves
    const [record, classes] = await Promise.all([
      getStaffAttendanceForToday(staffId, today),
      getAllClasses(),
    ])
    const myClass = classes.find((c) => c.teacher_id === staffId)
    const staffRow = {
      id: staffId,
      first_name: session.user.name?.split(' ')[0] ?? '',
      last_name: session.user.name?.split(' ').slice(1).join(' ') ?? '',
      display_name: session.user.name ?? null,
      class_name: myClass?.name ?? null,
      room_number: myClass?.room_number ?? null,
    }

    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Your Attendance Today
        </h1>
        <StaffAttendanceTable
          rows={[{ staff: staffRow, record }]}
          defaultTime={currentTime}
          date={today}
        />
      </div>
    )
  }

  // Admin / headteacher: full staff list with date picker
  const { date: qDate } = await searchParams
  const selectedDate = qDate ?? today
  const isToday = selectedDate === today
  const defaultTime = isToday ? currentTime : '09:00'

  const [allStaff, attendanceRecords, classes] = await Promise.all([
    getAllStaff(),
    getStaffAttendanceByDate(selectedDate),
    getAllClasses(),
  ])

  const recordByStaffId = Object.fromEntries(
    attendanceRecords.map((r) => [r.staff_id, r]),
  )
  const classByTeacherId = Object.fromEntries(
    classes.filter((c) => c.teacher_id).map((c) => [c.teacher_id!, c]),
  )

  const rows = allStaff
    .filter((s) => s.role !== 'admin')
    .map((s) => {
      const cls = classByTeacherId[s.id]
      return {
        staff: {
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          display_name: s.display_name,
          class_name: cls?.name ?? null,
          room_number: cls?.room_number ?? null,
        },
        record: recordByStaffId[s.id] ?? null,
      }
    })
    .sort((a, b) => {
      const ca = a.staff.class_name
      const cb = b.staff.class_name
      if (ca === cb) return 0
      if (ca === null) return 1
      if (cb === null) return -1
      return ca.localeCompare(cb)
    })

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString(
    'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  )

  return (
    <div className="max-w-5xl print:max-w-none">
      <style>{`@page { size: A4 portrait; margin: 10mm; } @media print { a[href]::after { content: none !important; } }`}</style>

      {/* Screen toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Sign-In</h1>
          <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="flex items-end gap-3">
          <DatePicker selectedDate={selectedDate} />
          <PrintButton />
        </div>
      </div>

      {/* Print-only title */}
      <div className="mb-4 hidden print:block">
        <h1 className="text-xl font-bold">Staff Sign-In Sheet</h1>
        <div className="mt-2">
          <p className="text-xs font-bold tracking-wide text-gray-900 uppercase">
            Date
          </p>
          <p className="mt-1 min-w-[120px] border-b border-gray-300 pb-1 text-sm">
            &nbsp;
          </p>
        </div>
      </div>

      {/* Screen interactive table */}
      <div className="print:hidden">
        <StaffAttendanceTable
          rows={rows}
          defaultTime={defaultTime}
          date={selectedDate}
        />
      </div>

      {/* Print-only static table */}
      <div className="hidden print:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {[
                '#',
                'Name',
                'Class',
                'Room',
                'Arrival Time',
                'Departure Time',
              ].map((h) => (
                <th
                  key={h}
                  className="border border-gray-400 p-1 text-left text-xs font-bold text-gray-900"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ staff, record }, i) => (
              <tr key={staff.id}>
                <td className="border border-gray-400 p-1 text-xs text-gray-500">
                  {i + 1}
                </td>
                <td className="border border-gray-400 p-1 text-xs font-medium text-gray-900">
                  {staff.display_name ??
                    `${staff.first_name} ${staff.last_name}`}
                </td>
                <td className="border border-gray-400 p-1 text-xs text-gray-700">
                  {staff.class_name ?? '—'}
                </td>
                <td className="border border-gray-400 p-1 text-xs text-gray-700">
                  {staff.room_number ?? '—'}
                </td>
                <td className="border border-gray-400 p-1 text-xs text-gray-700">
                  {record ? (
                    fmtTime(record.signed_in_at)
                  ) : (
                    <span className="block min-w-[80px] border-b border-gray-400">
                      &nbsp;
                    </span>
                  )}
                </td>
                <td className="border border-gray-400 p-1 text-xs text-gray-700">
                  {record?.signed_out_at ? (
                    fmtTime(record.signed_out_at)
                  ) : (
                    <span className="block min-w-[80px] border-b border-gray-400">
                      &nbsp;
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
