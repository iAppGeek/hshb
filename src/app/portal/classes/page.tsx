import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllClassesIncludingInactive, getClassesByTeacher } from '@/db'
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
  const canEdit = role === 'admin' || role === 'headteacher'

  const classes = canEdit
    ? await getAllClassesIncludingInactive()
    : await getClassesByTeacher(session.user.staffId)

  return (
    <>
      <PageHeader
        title="Classes"
        action={
          canEdit && (
            <Link
              href="/portal/classes/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Add Class
            </Link>
          )
        }
      />

      {classes.length === 0 ? (
        <EmptyState message="No classes found." />
      ) : (
        <ClassesTable classes={classes as ClassRow[]} canEdit={canEdit} />
      )}
    </>
  )
}
