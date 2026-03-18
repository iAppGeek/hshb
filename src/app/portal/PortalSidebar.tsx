'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowPathIcon,
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

import logo from '@/images/logo.png'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '/portal/dashboard': HomeIcon,
  '/portal/students': UsersIcon,
  '/portal/classes': AcademicCapIcon,
  '/portal/attendance': ClipboardDocumentCheckIcon,
  '/portal/incidents': ExclamationTriangleIcon,
  '/portal/staff': UserGroupIcon,
  '/portal/reports': ChartBarIcon,
}

type NavItem = {
  href: string
  label: string
}

type Props = {
  navItems: NavItem[]
  userName: string | null | undefined
  userEmail: string | null | undefined
  roleLabel: string | null
  signOutAction: () => Promise<void>
  refreshAction: () => Promise<void>
  notificationSlot?: React.ReactNode
}

export default function PortalSidebar({
  navItems,
  userName,
  userEmail,
  roleLabel,
  signOutAction,
  refreshAction,
  notificationSlot,
}: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = navItems.map(({ href, label }) => {
    const Icon = iconMap[href]
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        {label}
      </Link>
    )
  })

  const userFooter = (
    <div className="border-t border-gray-700 px-4 py-4">
      <p className="cursor-default truncate text-sm font-medium text-white select-none">
        {userName}
      </p>
      {roleLabel && (
        <p className="mt-0.5 cursor-default text-xs text-gray-400 select-none">
          {roleLabel}
        </p>
      )}
      {userEmail && (
        <button
          type="button"
          title={`Click to copy — ${userEmail}`}
          onClick={() => navigator.clipboard.writeText(userEmail)}
          className="mt-0.5 block w-full truncate text-left text-xs text-gray-400 transition hover:text-white"
        >
          {userEmail}
        </button>
      )}
      {notificationSlot && (
        <div className="mt-3 rounded-lg bg-gray-800 px-3 py-2">
          {notificationSlot}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4">
        <form action={refreshAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-gray-400 transition hover:text-white"
            title="Refresh data — clears the cache and reloads the latest data from the database"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh data
          </button>
        </form>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-gray-400 transition hover:text-white"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar — only visible on narrow screens */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 bg-gray-900 px-4 md:hidden print:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Link
          href="/"
          title="Go to main site"
          className="transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <Image src={logo} alt="HSHB Logo" className="h-7 w-auto" />
        </Link>
        <span className="text-sm font-semibold text-white">Staff Portal</span>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 transition-transform duration-200 md:hidden print:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              title="Go to main site"
              className="transition-transform duration-150 hover:scale-110 active:scale-95"
            >
              <Image src={logo} alt="HSHB Logo" className="h-7 w-auto" />
            </Link>
            <span className="text-sm font-semibold text-white">
              Staff Portal
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Close navigation"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">{navLinks}</nav>
        {userFooter}
      </aside>

      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden w-64 shrink-0 flex-col bg-gray-900 md:flex print:hidden">
        <div className="flex items-center gap-3 border-b border-gray-700 px-5 py-4">
          <Link
            href="/"
            title="Go to main site"
            className="transition-transform duration-150 hover:scale-110 active:scale-95"
          >
            <Image src={logo} alt="HSHB Logo" className="h-8 w-auto" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-white">HSHB</p>
            <p className="text-xs text-gray-400">Staff Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">{navLinks}</nav>
        {userFooter}
      </aside>
    </>
  )
}
