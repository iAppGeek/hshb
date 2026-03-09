import { type Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import { getAllStudents, getStudentsByClass, getClassesByTeacher } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import StudentsTable from './StudentsTable'

export const metadata: Metadata = { title: 'Students' }

export default async function StudentsPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId

  const isTeacher = role === 'teacher'

  let students
  if (isTeacher) {
    const classes = await getClassesByTeacher(staffId!)
    const classIds = classes.map((c) => c.id)
    const perClass = await Promise.all(
      classIds.map((id) => getStudentsByClass(id)),
    )
    students = perClass.flat()
  } else {
    students = await getAllStudents()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        {role !== 'teacher' && (
          <Link
            href="/portal/students/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Add student
          </Link>
        )}
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No students found.</p>
        </div>
      ) : (
        <StudentsTable students={students} />
      )}
    </div>
  )
}
