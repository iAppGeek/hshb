import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { canAccessReports, isTeachingStaff } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'
import {
  getStudentCount,
  getEnrollmentCountsByClass,
  getAllClasses,
  getAllStaff,
  getAttendanceSummaryByDate,
  getAttendanceLateCount,
  getStaffSignedInCount,
  getStaffAttendanceByDateRange,
  getAttendanceByDateRange,
  getIncidentCountsByDateRange,
} from '@/db'

import ReportsModeSelector from './_components/ReportsModeSelector'
import type { ReportMode } from './_components/ReportsModeSelector'
import DayReport from './_components/DayReport'
import PeriodReport from './_components/PeriodReport'
import type { StaffDaysWorkedRow } from './_components/PeriodReport'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string
    date?: string
    month?: string
    from?: string
    to?: string
  }>
}) {
  const session = await auth()
  const role = session?.user?.role as StaffRole | undefined
  if (!session || !role || !canAccessReports(role)) {
    redirect('/portal/dashboard')
  }

  const today = new Date().toISOString().split('T')[0]
  const params = await searchParams

  const mode: ReportMode =
    params.mode === 'month' || params.mode === 'range' ? params.mode : 'day'

  // Derive date params for each mode
  const selectedDate = params.date ?? today
  const selectedMonth = params.month ?? today.slice(0, 7)
  const [yearNum, monthNum] = selectedMonth.split('-').map(Number)
  const monthStart = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
  const monthEnd = new Date(yearNum, monthNum, 0).toISOString().split('T')[0]

  const todayDate = new Date(today + 'T12:00:00')
  todayDate.setDate(todayDate.getDate() - 7)
  const sevenDaysAgo = todayDate.toISOString().split('T')[0]
  const rangeFrom = params.from ?? sevenDaysAgo
  const rangeTo = params.to ?? today

  // Selector props
  const selectorProps = {
    mode,
    date: selectedDate,
    month: selectedMonth,
    from: rangeFrom,
    to: rangeTo,
  }

  // Build heading subtitle
  let subtitle: string
  let badgeLabel: string | null = null
  let badgeColor = 'bg-amber-500'

  if (mode === 'day') {
    subtitle = new Date(selectedDate + 'T12:00:00').toLocaleDateString(
      'en-GB',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    )
    if (selectedDate === today) {
      badgeLabel = 'Today'
      badgeColor = 'bg-green-500'
    } else if (selectedDate < today) {
      badgeLabel = 'Historical'
    } else {
      badgeLabel = 'Future'
    }
  } else if (mode === 'month') {
    subtitle = new Date(yearNum, monthNum - 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })
  } else {
    const fmtShort = (d: string) =>
      new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    subtitle = `${fmtShort(rangeFrom)} – ${fmtShort(rangeTo)}`
  }

  // ── Day mode ───────────────────────────────────────────────────────────────
  if (mode === 'day') {
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

    const teachingStaff = staff.filter((s) =>
      isTeachingStaff(s.role as StaffRole),
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
      <>
        <PageHeader
          subtitle={subtitle}
          badgeLabel={badgeLabel}
          badgeColor={badgeColor}
          selector={<ReportsModeSelector {...selectorProps} />}
        />
        <DayReport stats={stats} enrolmentByClass={enrolmentByClass} />
      </>
    )
  }

  // ── Month / Range mode ─────────────────────────────────────────────────────
  const startDate = mode === 'month' ? monthStart : rangeFrom
  const endDate = mode === 'month' ? monthEnd : rangeTo

  const [
    staffAttendanceRows,
    attendanceRows,
    enrollmentCounts,
    classes,
    staff,
    incidentCounts,
  ] = await Promise.all([
    getStaffAttendanceByDateRange(startDate, endDate),
    getAttendanceByDateRange(startDate, endDate),
    getEnrollmentCountsByClass(),
    getAllClasses(),
    getAllStaff(),
    getIncidentCountsByDateRange(startDate, endDate),
  ])

  // Staff days worked
  const staffAttendanceMap = new Map<string, Set<string>>()
  for (const row of staffAttendanceRows) {
    if (!staffAttendanceMap.has(row.staff_id)) {
      staffAttendanceMap.set(row.staff_id, new Set())
    }
    staffAttendanceMap.get(row.staff_id)!.add(row.date)
  }

  // School days = any date where staff signed in OR attendance was taken
  const schoolDayDatesSet = new Set([
    ...staffAttendanceRows.map((r) => r.date),
    ...attendanceRows.map((r) => r.date),
  ])
  const totalSchoolDays = schoolDayDatesSet.size

  // Per-date record counts
  const staffCountByDate = new Map<string, number>()
  for (const row of staffAttendanceRows) {
    staffCountByDate.set(row.date, (staffCountByDate.get(row.date) ?? 0) + 1)
  }
  const attendanceCountByDate = new Map<string, number>()
  for (const row of attendanceRows) {
    attendanceCountByDate.set(
      row.date,
      (attendanceCountByDate.get(row.date) ?? 0) + 1,
    )
  }

  const schoolDayDates = [...schoolDayDatesSet].sort().map((date) => ({
    date,
    staffCount: staffCountByDate.get(date) ?? 0,
    attendanceCount: attendanceCountByDate.get(date) ?? 0,
  }))

  const teachingStaff = staff.filter((s) =>
    isTeachingStaff(s.role as StaffRole),
  )

  const staffDaysWorked: StaffDaysWorkedRow[] = teachingStaff
    .map((s) => ({
      name: s.display_name ?? `${s.first_name} ${s.last_name}`,
      role: s.role,
      daysWorked: staffAttendanceMap.get(s.id)?.size ?? 0,
      dates: [...(staffAttendanceMap.get(s.id) ?? [])].sort(),
    }))
    .sort((a, b) => b.daysWorked - a.daysWorked)

  // Per-class attendance
  const classCountsMap = new Map<
    string,
    { present: number; absent: number; late: number }
  >()
  for (const row of attendanceRows) {
    if (!classCountsMap.has(row.class_id)) {
      classCountsMap.set(row.class_id, { present: 0, absent: 0, late: 0 })
    }
    const entry = classCountsMap.get(row.class_id)!
    if (row.status === 'present') entry.present++
    else if (row.status === 'late') {
      entry.present++ // late counts toward attendance
      entry.late++
    } else if (row.status === 'absent') entry.absent++
  }

  const classSummary = classes.map((cls) => {
    const counts = classCountsMap.get(cls.id)
    return {
      name: cls.name,
      enrolled: enrollmentCounts[cls.id] ?? 0,
      presentCount: counts?.present ?? 0,
      absentCount: counts?.absent ?? 0,
      lateCount: counts?.late ?? 0,
    }
  })

  return (
    <>
      <PageHeader
        subtitle={subtitle}
        badgeLabel={badgeLabel}
        badgeColor={badgeColor}
        selector={<ReportsModeSelector {...selectorProps} />}
      />
      <PeriodReport
        staffDaysWorked={staffDaysWorked}
        totalSchoolDays={totalSchoolDays}
        schoolDayDates={schoolDayDates}
        classSummary={classSummary}
        incidentCounts={incidentCounts}
      />
    </>
  )
}

// ── Shared header ────────────────────────────────────────────────────────────

function PageHeader({
  subtitle,
  badgeLabel,
  badgeColor,
  selector,
}: {
  subtitle: string
  badgeLabel: string | null
  badgeColor: string
  selector: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Reports &amp; Analytics
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-gray-500">{subtitle}</p>
          {badgeLabel && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium text-white print:hidden ${badgeColor}`}
            >
              {badgeLabel}
            </span>
          )}
        </div>
      </div>
      <div className="print:hidden">{selector}</div>
    </div>
  )
}
