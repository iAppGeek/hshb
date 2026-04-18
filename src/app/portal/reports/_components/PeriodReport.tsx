import type { IncidentCounts } from '@/db'
import { formatCalendarDate } from '@/lib/datetime'

import SectionCard from '../../_components/SectionCard'

import SchoolDaysCard from './SchoolDaysCard'
import type { SchoolDayDate } from './SchoolDaysCard'

export type StaffDaysWorkedRow = {
  name: string
  role: string
  daysWorked: number
  dates: string[]
}

type ClassSummaryRow = {
  name: string
  enrolled: number
  presentCount: number
  absentCount: number
  lateCount: number
}

type Props = {
  staffDaysWorked: StaffDaysWorkedRow[]
  totalSchoolDays: number
  schoolDayDates: SchoolDayDate[]
  classSummary: ClassSummaryRow[]
  incidentCounts: IncidentCounts
}

const TH =
  'px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase'

function formatDateShort(dateStr: string): string {
  const day = formatCalendarDate(dateStr, { weekday: 'short' })
  const match = dateStr.match(/^\d{4}-\d{2}-(\d{2})/)
  const dayOfMonth = match ? Number(match[1]) : ''
  return `${day} ${dayOfMonth}`
}

function pct(n: number, total: number): string {
  return total > 0 ? `${Math.round((n / total) * 100)}%` : '—'
}

export default function PeriodReport({
  staffDaysWorked,
  totalSchoolDays,
  schoolDayDates,
  classSummary,
  incidentCounts,
}: Props) {
  return (
    <>
      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SchoolDaysCard
          totalSchoolDays={totalSchoolDays}
          dates={schoolDayDates}
        />
        <div className="group relative rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6">
          <p className="text-sm text-gray-500">Incidents</p>
          <p className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {incidentCounts.total}
            </span>
          </p>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          >
            Medical, behaviour &amp; other incidents in period
          </span>
        </div>
      </div>

      {/* Incidents summary */}
      {incidentCounts.total > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
            {incidentCounts.total} incident
            {incidentCounts.total !== 1 ? 's' : ''}
          </span>
          {incidentCounts.medical > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              {incidentCounts.medical} medical
            </span>
          )}
          {incidentCounts.behaviour > 0 && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-800">
              {incidentCounts.behaviour} behaviour
            </span>
          )}
          {incidentCounts.other > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
              {incidentCounts.other} other
            </span>
          )}
        </div>
      )}

      {/* Staff Days Worked */}
      <div className="mb-8">
        <SectionCard title="Staff Days Worked">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className={TH}>Name</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Days Worked</th>
                  <th className={TH}>Dates Signed In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffDaysWorked.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 capitalize">
                      {row.role}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className="font-medium">
                        {row.daysWorked}/{totalSchoolDays}
                      </span>{' '}
                      <span className="text-gray-400">
                        ({pct(row.daysWorked, totalSchoolDays)})
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {row.dates.length > 0
                        ? row.dates.map((d) => formatDateShort(d)).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {staffDaysWorked.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-gray-400"
                    >
                      No staff attendance data for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Attendance Summary by Class */}
      <SectionCard title="Attendance Summary by Class">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={TH}>Class</th>
                <th className={TH}>Enrolled</th>
                <th className={TH}>Attendance %</th>
                <th className={TH}>Absences</th>
                <th className={TH}>Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classSummary.map((row) => {
                const possibleAttendance = row.enrolled * totalSchoolDays
                const attendanceRate = pct(row.presentCount, possibleAttendance)
                return (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {row.enrolled}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className="font-medium">{attendanceRate}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {row.absentCount}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {row.lateCount}
                    </td>
                  </tr>
                )
              })}
              {classSummary.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-400"
                  >
                    No attendance data for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  )
}
