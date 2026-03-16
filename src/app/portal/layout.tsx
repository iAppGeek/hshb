import { type Metadata, type Viewport } from 'next'

import { auth, signOut } from '@/auth'
import type { StaffRole } from '@/types/next-auth'

import IosSplashLinks from './IosSplashLinks'
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
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'HSHB Portal',
  },
  icons: { apple: '/icons/portal-icon-192.png' },
}

const navItems = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/students', label: 'Students' },
  { href: '/portal/classes', label: 'Classes' },
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
  const isAdminOrHead = role === 'admin' || role === 'headteacher'
  const visibleNav = navItems
    .filter((item) => !item.roles || item.roles.includes(role as StaffRole))
    .map(({ href, label }) => ({ href, label }))

  const signOutAction = async () => {
    'use server'
    await signOut({ redirectTo: '/portal/login' })
  }

  return (
    <>
      <IosSplashLinks />
      <div className="flex min-h-screen bg-gray-100">
        <PwaRegistrar />
        <PortalSidebar
          navItems={visibleNav}
          userName={session?.user?.name}
          roleLabel={role ? roleLabels[role] : null}
          signOutAction={signOutAction}
          notificationSlot={isAdminOrHead ? <NotificationToggle /> : null}
        />

        {/* pt-20 on mobile clears the fixed top bar; reverts to p-8 on md+ */}
        <main className="flex-1 overflow-auto px-4 py-6 pt-20 md:p-8">
          {isAdminOrHead && <NotificationBanner />}
          {children}
        </main>
      </div>
    </>
  )
}
