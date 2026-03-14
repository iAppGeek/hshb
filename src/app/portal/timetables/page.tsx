import { type Metadata } from 'next'

import { auth } from '@/auth'
import {
  getAllTimetableSlots,
  getTimetableByClass,
  getClassesByTeacher,
  getAllClasses,
} from '@/db'
import type { StaffRole } from '@/types/next-auth'

export const metadata: Metadata = { title: 'Timetables' }

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export default async function TimetablesPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId
  const isTeacher = role === 'teacher'

  const [classes, slots] = await Promise.all([
    isTeacher ? getClassesByTeacher(staffId!) : getAllClasses(),
    isTeacher
      ? (async () => {
          const myClasses = await getClassesByTeacher(staffId!)
          const perClass = await Promise.all(
            myClasses.map((c) => getTimetableByClass(c.id)),
          )
          return perClass.flat()
        })()
      : getAllTimetableSlots(),
  ])

  const slotsByDay = DAYS.map((day) => ({
    day,
    slots: slots.filter((s) => s.day_of_week === day),
  })).filter((d) => d.slots.length > 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Timetables</h1>
        {(role === 'admin' || role === 'headteacher') && (
          <button
            disabled
            title="Timetable slot creation coming soon"
            className="cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 shadow-sm"
          >
            Add slot
          </button>
        )}
      </div>

      {slotsByDay.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No timetable slots found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {slotsByDay.map(({ day, slots: daySlots }) => (
            <div
              key={day}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 className="text-sm font-semibold text-gray-700">{day}</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Room
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {daySlots.map((slot) => {
                    const cls = classes.find((c) => c.id === slot.class_id)
                    return (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {slot.start_time.slice(0, 5)} –{' '}
                          {slot.end_time.slice(0, 5)}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {cls?.name ?? '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {slot.subject ?? '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {slot.room ?? cls?.room_number ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
