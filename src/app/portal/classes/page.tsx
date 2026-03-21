import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllClassesIncludingInactive, getClassesByTeacher } from '@/db'
import Tooltip from '@/components/Tooltip'
import {
  canEditClasses,
  canCreateClasses,
  canSeeAllData,
} from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import EmptyState from '../_components/EmptyState'
import PageHeader from '../_components/PageHeader'

import ClassesTable, { type ClassRow } from './ClassesTable'

export const metadata: Metadata = { title: 'Classes' }

export default async function ClassesPage() {
  const session = await auth()
  if (!session) {
    redirect('/portal/login')
  }

  const role = session.user?.role as StaffRole
  const canEdit = canEditClasses(role)

  const classes = canSeeAllData(role)
    ? await getAllClassesIncludingInactive()
    : await getClassesByTeacher(session.user.staffId)

  return (
    <>
      <PageHeader
        title="Classes"
        action={
          canCreateClasses(role) ? (
            <Link
              href="/portal/classes/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Add Class
            </Link>
          ) : canSeeAllData(role) ? (
            <Tooltip text="You don't have permission to add classes">
              <span className="cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 shadow-sm">
                Add Class
              </span>
            </Tooltip>
          ) : null
        }
      />

      {classes.length === 0 ? (
        <EmptyState message="No classes found." />
      ) : (
        <ClassesTable
          classes={classes as ClassRow[]}
          canEdit={canEdit}
          role={role}
        />
      )}
    </>
  )
}
