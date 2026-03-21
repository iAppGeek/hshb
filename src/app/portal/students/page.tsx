import { type Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import { getAllStudents, getStudentsByTeacher } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import EmptyState from '../_components/EmptyState'
import PageHeader from '../_components/PageHeader'

import StudentsTable from './StudentsTable'

export const metadata: Metadata = { title: 'Students' }

export default async function StudentsPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId

  const isTeacher = role === 'teacher'

  const students = isTeacher
    ? await getStudentsByTeacher(staffId!)
    : await getAllStudents()

  return (
    <>
      <PageHeader
        title="Students"
        action={
          role === 'admin' && (
            <Link
              href="/portal/students/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Add student
            </Link>
          )
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
