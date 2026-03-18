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
    startupImage: [
      // iPhone SE / 6 / 7 / 8 portrait
      {
        url: '/icons/splash/apple-splash-750-1334.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPhone XR / 11 portrait
      {
        url: '/icons/splash/apple-splash-828-1792.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPhone X / XS / 11 Pro / 12 mini / 13 mini portrait
      {
        url: '/icons/splash/apple-splash-1125-2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone XS Max / 11 Pro Max portrait
      {
        url: '/icons/splash/apple-splash-1242-2688.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 12 / 12 Pro / 13 / 13 Pro / 14 portrait
      {
        url: '/icons/splash/apple-splash-1170-2532.png',
        media:
          '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 12 Pro Max / 13 Pro Max / 14 Plus portrait
      {
        url: '/icons/splash/apple-splash-1284-2778.png',
        media:
          '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 14 Pro / 15 Pro portrait
      {
        url: '/icons/splash/apple-splash-1179-2556.png',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 16 Pro Max / 17 Pro Max portrait
      {
        url: '/icons/splash/apple-splash-1320-2868.png',
        media:
          '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 16 Pro / 17 / 17 Pro / 17 Air portrait
      {
        url: '/icons/splash/apple-splash-1206-2622.png',
        media:
          '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPhone 14 Pro Max / 15 Pro Max / 16 Plus portrait
      {
        url: '/icons/splash/apple-splash-1290-2796.png',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      // iPad mini / iPad portrait
      {
        url: '/icons/splash/apple-splash-1536-2048.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPad Pro 11" / iPad Air portrait
      {
        url: '/icons/splash/apple-splash-1668-2388.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      // iPad Pro 12.9" portrait
      {
        url: '/icons/splash/apple-splash-2048-2732.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
    ],
  },
  icons: { apple: '/icons/portal-icon-192.png' },
}

const navItems = [
  { href: '/portal/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { href: '/portal/students', label: 'Students', Icon: UsersIcon },
  { href: '/portal/classes', label: 'Classes', Icon: AcademicCapIcon },
  {
    href: '/portal/attendance',
    label: 'Attendance',
    Icon: ClipboardDocumentCheckIcon,
  },
  {
    href: '/portal/incidents',
    label: 'Incidents',
    Icon: ExclamationTriangleIcon,
  },
  { href: '/portal/staff', label: 'Staff', Icon: UserGroupIcon },
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
      <aside className="hidden w-64 shrink-0 flex-col bg-gray-900 md:flex print:hidden">
        <div className="flex items-center gap-3 border-b border-gray-700 px-5 py-4">
          <Image src={logo} alt="HSHB Logo" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold text-white">HSHB</p>
            <p className="text-xs text-gray-400">Staff Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">{allNavItems}</nav>
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
      <div className="flex min-h-screen bg-gray-100">
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
