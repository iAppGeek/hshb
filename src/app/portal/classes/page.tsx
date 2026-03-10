import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllClassesIncludingInactive, getClassesByTeacher } from '@/db'
import type { StaffRole } from '@/types/next-auth'

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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        {canEdit && (
          <Link
            href="/portal/classes/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Add Class
          </Link>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No classes found.</p>
        </div>
      ) : (
        <ClassesTable classes={classes as ClassRow[]} canEdit={canEdit} />
      )}
    </div>
  )
}
