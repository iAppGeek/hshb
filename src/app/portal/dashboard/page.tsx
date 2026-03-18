import { type Metadata } from 'next'
import Link from 'next/link'
import {
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

import { auth } from '@/auth'
import {
  getStudentCount,
  getStudentsByTeacher,
  getAllClasses,
  getClassesByTeacher,
  getAllStaff,
  getIncidentCount,
  getGuardianCount,
} from '@/db'
import type { StaffRole } from '@/types/next-auth'

export const metadata: Metadata = { title: 'Dashboard' }

const roleLabels: Record<StaffRole, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  headteacher: 'Headteacher',
}

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId

  const isTeacher = role === 'teacher'

  const [studentCount, classes, staffCount, incidentCount, guardianCount] =
    await Promise.all([
      isTeacher
        ? getStudentsByTeacher(staffId!).then((s) => s.length)
        : getStudentCount(),
      isTeacher ? getClassesByTeacher(staffId!) : getAllClasses(),
      isTeacher ? Promise.resolve(null) : getAllStaff().then((s) => s.length),
      isTeacher ? Promise.resolve(null) : getIncidentCount(),
      isTeacher ? Promise.resolve(null) : getGuardianCount(),
    ])

  const stats = [
    {
      label: isTeacher ? 'My Students' : 'Total Students',
      value: studentCount,
      icon: UsersIcon,
      href: '/portal/students',
    },
    {
      label: isTeacher ? 'My Classes' : 'Total Classes',
      value: classes.length,
      icon: CalendarDaysIcon,
      href: '/portal/classes',
    },
    ...(role === 'admin' || role === 'headteacher'
      ? [
          {
            label: 'Total Staff',
            value: staffCount,
            icon: UserGroupIcon,
            href: '/portal/staff',
          },
          {
            label: 'Total Guardians',
            value: guardianCount,
            icon: UsersIcon,
            href: '/portal/students',
          },
          {
            label: 'Total Incidents',
            value: incidentCount,
            icon: ExclamationTriangleIcon,
            href: '/portal/incidents',
          },
          {
            label: 'Reports',
            value: null,
            icon: ChartBarIcon,
            href: '/portal/reports',
          },
        ]
      : []),
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{roleLabels[role]}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
          >
            <div className="rounded-lg bg-blue-50 p-3 transition group-hover:bg-blue-100">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">
                {value ?? '—'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
