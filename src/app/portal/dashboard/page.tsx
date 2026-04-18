import { type Metadata } from 'next'
import Link from 'next/link'
import {
  UsersIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'

import { auth } from '@/auth'
import {
  getStudentCount,
  getStudentsByTeacher,
  getAllClasses,
  getClassesByTeacher,
  getTeachers,
  getIncidentCount,
  getLessonPlanCountByDate,
  getAttendanceSummaryByDate,
  getStaffSignedInCount,
} from '@/db'
import { todayInSchoolTz } from '@/lib/datetime'
import { isTeacher } from '@/lib/permissions'
import { roleLabels } from '@/lib/roleLabels'
import type { StaffRole } from '@/types/next-auth'

export const metadata: Metadata = { title: 'Dashboard' }

const pct = (n: number, total: number) =>
  total > 0 ? `${Math.round((n / total) * 100)}%` : '—'

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId
  const teacherOnly = isTeacher(role)
  const today = todayInSchoolTz()

  const [
    studentCount,
    classes,
    teachers,
    incidentCount,
    lessonPlanCount,
    attendanceSummary,
    staffSignedInCount,
  ] = await Promise.all([
    teacherOnly
      ? getStudentsByTeacher(staffId!).then((s) => s.length)
      : getStudentCount(),
    teacherOnly ? getClassesByTeacher(staffId!) : getAllClasses(),
    teacherOnly ? Promise.resolve([] as { id: string }[]) : getTeachers(),
    teacherOnly ? Promise.resolve(null) : getIncidentCount(),
    teacherOnly ? Promise.resolve(null) : getLessonPlanCountByDate(today),
    teacherOnly
      ? Promise.resolve({} as Record<string, { presentCount: number }>)
      : getAttendanceSummaryByDate(today),
    teacherOnly ? Promise.resolve(null) : getStaffSignedInCount(today),
  ])

  const presentToday = Object.values(attendanceSummary).reduce(
    (sum, s) => sum + s.presentCount,
    0,
  )
  const registersSubmitted = Object.keys(attendanceSummary).length

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{roleLabels[role]}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Row 1: Students */}
        {!teacherOnly && (
          <Link
            href="/portal/attendance"
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:p-6"
          >
            <p className="text-sm text-gray-500">Students attendance today</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {presentToday}/{studentCount}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {pct(presentToday, studentCount as number)}
              </span>
            </p>
          </Link>
        )}

        <Link
          href="/portal/students"
          className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:gap-4 sm:p-6"
        >
          <div className="rounded-lg bg-blue-50 p-3 transition group-hover:bg-blue-100">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {teacherOnly ? 'My Students' : 'Total Students'}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-gray-900">
              {studentCount}
            </p>
          </div>
        </Link>

        {/* Row 2: Classes */}
        {!teacherOnly && (
          <Link
            href="/portal/attendance"
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:p-6"
          >
            <p className="text-sm text-gray-500">Attendance submitted today</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {registersSubmitted}/{classes.length}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {pct(registersSubmitted, classes.length)}
              </span>
            </p>
          </Link>
        )}

        <Link
          href="/portal/classes"
          className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:gap-4 sm:p-6"
        >
          <div className="rounded-lg bg-blue-50 p-3 transition group-hover:bg-blue-100">
            <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {teacherOnly ? 'My Classes' : 'Total Classes'}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-gray-900">
              {classes.length}
            </p>
          </div>
        </Link>

        {/* Row 3: Teachers / Staff signed in */}
        {!teacherOnly && (
          <>
            <Link
              href="/portal/staff-attendance"
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:p-6"
            >
              <p className="text-sm text-gray-500">Staff signed in today</p>
              <p className="mt-1 flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {staffSignedInCount}/{teachers.length}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {pct(staffSignedInCount ?? 0, teachers.length)}
                </span>
              </p>
            </Link>

            <Link
              href="/portal/staff"
              className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:gap-4 sm:p-6"
            >
              <div className="rounded-lg bg-blue-50 p-3 transition group-hover:bg-blue-100">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Teachers
                </p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900">
                  {teachers.length}
                </p>
              </div>
            </Link>
          </>
        )}

        {/* Row 4: Lesson Plans / Incidents */}
        {!teacherOnly && (
          <>
            <Link
              href="/portal/lesson-plans"
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:p-6"
            >
              <p className="flex items-center gap-1 text-sm text-gray-500">
                Lessons planned today
                <span
                  title="Number of lesson plans submitted today as a percentage of total active classes"
                  className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400"
                >
                  ?
                </span>
              </p>
              <p className="mt-1 flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {lessonPlanCount}/{classes.length}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {pct(lessonPlanCount ?? 0, classes.length)}
                </span>
              </p>
            </Link>

            <Link
              href="/portal/incidents"
              className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:gap-4 sm:p-6"
            >
              <div className="rounded-lg bg-blue-50 p-3 transition group-hover:bg-blue-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Incidents
                </p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900">
                  {incidentCount}
                </p>
              </div>
            </Link>
          </>
        )}
      </div>
    </>
  )
}
