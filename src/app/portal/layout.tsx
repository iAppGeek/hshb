import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

import { auth, signOut } from '@/auth'
import logo from '@/images/logo.png'
import type { StaffRole } from '@/types/next-auth'

export const metadata: Metadata = { title: { template: '%s | Staff Portal' , default: 'Staff Portal' } }

const navItems = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/portal/students', label: 'Students', icon: UsersIcon },
  { href: '/portal/timetables', label: 'Timetables', icon: CalendarDaysIcon },
  { href: '/portal/attendance', label: 'Attendance', icon: ClipboardDocumentCheckIcon },
  { href: '/portal/staff', label: 'Staff', icon: UserGroupIcon },
  {
    href: '/portal/reports',
    label: 'Reports',
    icon: ChartBarIcon,
    roles: ['admin', 'headteacher'] as StaffRole[],
  },
]

const roleLabels: Record<StaffRole, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  headteacher: 'Headteacher',
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role
  const visibleNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(role as StaffRole),
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-gray-900">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-gray-700 px-5 py-4">
          <Image src={logo} alt="HSHB Logo" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold text-white">HSHB</p>
            <p className="text-xs text-gray-400">Staff Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-gray-700 px-4 py-4">
          <p className="truncate text-sm font-medium text-white">
            {session?.user?.name}
          </p>
          {role && (
            <p className="mt-0.5 text-xs text-gray-400">{roleLabels[role]}</p>
          )}
          <form
            className="mt-3"
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/portal/login' })
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-gray-400 transition hover:text-white"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
