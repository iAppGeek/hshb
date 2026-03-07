import { type Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import { getAllStudents, getStudentsByClass, getClassesByTeacher } from '@/db'
import type { StaffRole } from '@/types/next-auth'

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
    const perClass = await Promise.all(classIds.map((id) => getStudentsByClass(id)))
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
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Parent
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {student.last_name}, {student.first_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {student.student_code ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(student.class as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {student.primary_parent_name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/portal/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
