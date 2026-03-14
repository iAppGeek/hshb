import { type Metadata } from 'next'

import { auth, signOut } from '@/auth'
import type { StaffRole } from '@/types/next-auth'

import PortalSidebar from './PortalSidebar'

export const metadata: Metadata = {
  title: { template: '%s | Staff Portal', default: 'Staff Portal' },
}

const navItems = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/students', label: 'Students' },
  { href: '/portal/classes', label: 'Classes' },
  { href: '/portal/timetables', label: 'Timetables' },
  { href: '/portal/attendance', label: 'Attendance' },
  { href: '/portal/incidents', label: 'Incidents' },
  { href: '/portal/staff', label: 'Staff' },
  {
    href: '/portal/reports',
    label: 'Reports',
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
  const visibleNav = navItems
    .filter((item) => !item.roles || item.roles.includes(role as StaffRole))
    .map(({ href, label }) => ({ href, label }))

  const signOutAction = async () => {
    'use server'
    await signOut({ redirectTo: '/portal/login' })
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <PortalSidebar
        navItems={visibleNav}
        userName={session?.user?.name}
        roleLabel={role ? roleLabels[role] : null}
        signOutAction={signOutAction}
      />

      {/* pt-20 on mobile clears the fixed top bar; reverts to p-8 on md+ */}
      <main className="flex-1 overflow-auto p-6 pt-20 md:p-8">{children}</main>
    </div>
  )
}
