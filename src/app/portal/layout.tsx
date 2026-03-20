import { Suspense } from 'react'
import Image from 'next/image'
import { type Metadata, type Viewport } from 'next'
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

import { auth, signOut } from '@/auth'
import logo from '@/images/logo.png'
import type { StaffRole } from '@/types/next-auth'

import { revalidateAllCaches } from './actions'
import NotificationBanner from './NotificationBanner'
import NotificationToggle from './NotificationToggle'
import PortalSidebar from './PortalSidebar'
import PwaRegistrar from './PwaRegistrar'

export const viewport: Viewport = {
  themeColor: '#1e40af',
}

export const metadata: Metadata = {
  title: { template: '%s | Staff Portal', default: 'Staff Portal' },
  robots: { index: false, follow: false },
  manifest: '/manifest.portal.json',
  appleWebApp: {
    capable: true,
    title: 'HSHB Portal',
    statusBarStyle: 'default',
  },
  icons: { apple: '/icons/portal-icon-192.png' },
}

const navItems = [
  { href: '/portal/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { href: '/portal/staff', label: 'Staff', Icon: UserGroupIcon },
  { href: '/portal/students', label: 'Students', Icon: UsersIcon },
  { href: '/portal/classes', label: 'Classes', Icon: AcademicCapIcon },
  {
    href: '/portal/attendance',
    label: 'Attendance',
    Icon: ClipboardDocumentCheckIcon,
  },
  {
    href: '/portal/staff-attendance',
    label: 'Staff Sign-In',
    Icon: ClockIcon,
  },
  {
    href: '/portal/incidents',
    label: 'Incidents',
    Icon: ExclamationTriangleIcon,
  },
  {
    href: '/portal/reports',
    label: 'Reports',
    Icon: ChartBarIcon,
    roles: ['admin', 'headteacher'] as StaffRole[],
  },
]

const roleLabels: Record<StaffRole, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  headteacher: 'Headteacher',
}

async function AuthedSidebar() {
  const session = await auth()
  const role = session?.user?.role
  const isAdminOrHead = role === 'admin' || role === 'headteacher'
  const visibleNav = navItems
    .filter((item) => !item.roles || item.roles.includes(role as StaffRole))
    .map(({ href, label }) => ({ href, label }))

  const signOutAction = async () => {
    'use server'
    await signOut({ redirectTo: '/portal/login' })
  }

  return (
    <PortalSidebar
      navItems={visibleNav}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
      roleLabel={role ? roleLabels[role] : null}
      signOutAction={signOutAction}
      refreshAction={revalidateAllCaches}
      notificationSlot={isAdminOrHead ? <NotificationToggle /> : null}
    />
  )
}

async function AuthedNotificationBanner() {
  const session = await auth()
  const role = session?.user?.role
  const isAdminOrHead = role === 'admin' || role === 'headteacher'
  return isAdminOrHead ? <NotificationBanner /> : null
}

function SidebarLoadingSkeleton() {
  const allNavItems = navItems.map(({ href, label, Icon }) => (
    <div
      key={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300"
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </div>
  ))

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 bg-gray-900 px-4 md:hidden print:hidden">
        <div className="h-6 w-6 rounded bg-gray-700" />
        <Image src={logo} alt="HSHB Logo" className="h-7 w-auto" />
        <span className="text-sm font-semibold text-white">Staff Portal</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gray-900 md:flex print:hidden">
        <div className="flex items-center gap-3 border-b border-gray-700 px-5 py-4">
          <Image src={logo} alt="HSHB Logo" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold text-white">HSHB</p>
            <p className="text-xs text-gray-400">Staff Portal</p>
          </div>
        </div>
        <nav className="sidebar-nav flex-1 space-y-1 overflow-y-scroll px-3 py-4">
          {allNavItems}
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <p className="animate-pulse text-sm font-medium text-gray-400">
            Loading...
          </p>
        </div>
      </aside>
    </>
  )
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex min-h-screen bg-gray-100 print:min-h-0">
        <PwaRegistrar />
        <Suspense fallback={<SidebarLoadingSkeleton />}>
          <AuthedSidebar />
        </Suspense>

        {/* pt-20 on mobile clears the fixed top bar; reverts to p-8 on md+ */}
        <main className="flex-1 overflow-auto px-4 py-6 pt-20 md:p-8">
          <Suspense fallback={null}>
            <AuthedNotificationBanner />
          </Suspense>
          {children}
        </main>
      </div>
    </>
  )
}
