import { type ReactNode } from 'react'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { canAccessAdminTasks } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import AdminTabBar from './_components/AdminTabBar'
import ClassMigrationTab from './_tabs/class-migration/ClassMigrationTab'

export const metadata: Metadata = { title: 'Admin Tasks' }

const DEFAULT_TAB = 'class-migration'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sourceClassId?: string }>
}): Promise<ReactNode> {
  const session = await auth()
  const role = session?.user?.role as StaffRole | undefined

  if (!role || !canAccessAdminTasks(role)) {
    redirect('/portal/dashboard')
  }

  const { tab = DEFAULT_TAB, sourceClassId } = await searchParams

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administrative tools for managing the school year.
        </p>
      </div>

      <AdminTabBar currentTab={tab} />

      {tab === 'class-migration' && (
        <ClassMigrationTab sourceClassId={sourceClassId} />
      )}
    </div>
  )
}
