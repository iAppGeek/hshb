import { type Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import { getAllStudents, getStudentsByTeacher } from '@/db'
import Tooltip from '@/components/Tooltip'
import { isTeacher, canSeeAllData, canCreateStudents } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import EmptyState from '../_components/EmptyState'
import PageHeader from '../_components/PageHeader'

import StudentsTable from './StudentsTable'

export const metadata: Metadata = { title: 'Students' }

export default async function StudentsPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId

  const students = isTeacher(role)
    ? await getStudentsByTeacher(staffId!)
    : await getAllStudents()

  return (
    <>
      <PageHeader
        title="Students"
        action={
          canCreateStudents(role) ? (
            <Link
              href="/portal/students/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Add student
            </Link>
          ) : canSeeAllData(role) ? (
            <Tooltip text="You don't have permission to add students">
              <span className="cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 shadow-sm">
                Add student
              </span>
            </Tooltip>
          ) : null
        }
      />

      {students.length === 0 ? (
        <EmptyState message="No students found." />
      ) : (
        <StudentsTable students={students} role={role} />
      )}
    </>
  )
}
