import { type Metadata } from 'next'

import { auth } from '@/auth'
import {
  getAllTimetableSlots,
  getTimetableByClass,
  getClassesByTeacher,
  getAllClasses,
} from '@/db'
import { isTeacher, canEditTimetables } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import EmptyState from '../_components/EmptyState'
import PageHeader from '../_components/PageHeader'
import SectionCard from '../_components/SectionCard'

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

const TH =
  'px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase'

export default async function TimetablesPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId
  const teacherOnly = isTeacher(role)

  const [classes, slots] = await Promise.all([
    teacherOnly ? getClassesByTeacher(staffId!) : getAllClasses(),
    teacherOnly
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
    <>
      <PageHeader
        title="Timetables"
        action={
          canEditTimetables(role) && (
            <button
              disabled
              title="Timetable slot creation coming soon"
              className="cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 shadow-sm"
            >
              Add slot
            </button>
          )
        }
      />

      {slotsByDay.length === 0 ? (
        <EmptyState message="No timetable slots found." />
      ) : (
        <div className="space-y-6">
          {slotsByDay.map(({ day, slots: daySlots }) => (
            <SectionCard key={day} title={day}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className={TH}>Time</th>
                    <th className={TH}>Class</th>
                    <th className={TH}>Subject</th>
                    <th className={TH}>Room</th>
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
            </SectionCard>
          ))}
        </div>
      )}
    </>
  )
}
