import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getClassWithStudents } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import PrintButton from './PrintButton'

export const metadata: Metadata = { title: 'Class Register' }

type Student = {
  id: string
  first_name: string
  last_name: string
  allergies: string | null
  primary_guardian: {
    first_name: string
    last_name: string
    phone: string | null
  } | null
}

export default async function ClassRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/portal/login')

  const role = session.user?.role as StaffRole
  const { id } = await params

  const cls = await getClassWithStudents(id)
  if (!cls) redirect('/portal/classes')

  if (role === 'teacher' && cls.teacher_id !== session.user.staffId) {
    redirect('/portal/classes')
  }

  const teacher = cls.teacher as {
    first_name: string
    last_name: string
    display_name: string | null
    contact_number: string | null
  } | null

  const teacherName = teacher
    ? (teacher.display_name ?? `${teacher.first_name} ${teacher.last_name}`)
    : '—'

  const students = (cls.student_classes as Array<{ student: Student | null }>)
    .map((sc) => sc.student)
    .filter((s): s is Student => s !== null)
    .sort((a, b) => {
      const lnc = a.last_name.localeCompare(b.last_name)
      return lnc !== 0 ? lnc : a.first_name.localeCompare(b.first_name)
    })

  return (
    <div className="max-w-5xl print:max-w-none">
      {/* Screen-only toolbar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <Link
            href="/portal/classes"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Classes
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {cls.name} — Register
          </h1>
        </div>
        <PrintButton />
      </div>

      {/* Print-only title */}
      <div className="mb-4 hidden print:block">
        <h1 className="text-xl font-bold">{cls.name} — Class Register</h1>
      </div>

      {/* Class info */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:grid-cols-4 print:mb-4 print:rounded-none print:p-0 print:shadow-none print:ring-0">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Teacher
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {teacherName}
          </p>
          {teacher?.contact_number && (
            <p className="text-sm text-gray-500">{teacher.contact_number}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Year Group
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            Year {cls.year_group}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Academic Year
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {cls.academic_year ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Date
          </p>
          <p className="mt-1 min-w-[100px] border-b border-gray-300 pb-1 text-sm">
            &nbsp;
          </p>
        </div>
      </div>

      {/* Students */}
      {students.length === 0 ? (
        <p className="text-sm text-gray-500">
          No students enrolled in this class.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 print:overflow-visible print:rounded-none print:shadow-none print:ring-0">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 print:bg-white">
              <tr>
                {[
                  '#',
                  'First Name',
                  'Surname',
                  'Guardian',
                  'Contact',
                  'Allergies',
                  'Present',
                  'Absent',
                ].map((col) => (
                  <th
                    key={col}
                    className="border border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase print:border-gray-400 print:py-2 print:text-[10px]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 print:hover:bg-white"
                >
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500 print:border-gray-400 print:py-2 print:text-xs">
                    {i + 1}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 print:border-gray-400 print:py-2 print:text-xs">
                    {student.first_name}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 print:border-gray-400 print:py-2 print:text-xs">
                    {student.last_name}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 print:border-gray-400 print:py-2 print:text-xs">
                    {student.primary_guardian
                      ? `${student.primary_guardian.first_name} ${student.primary_guardian.last_name}`
                      : '—'}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 print:border-gray-400 print:py-2 print:text-xs">
                    {student.primary_guardian?.phone ?? '—'}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 print:border-gray-400 print:py-2 print:text-xs">
                    {student.allergies ?? '—'}
                  </td>
                  <td className="w-16 border border-gray-200 px-4 py-3 print:border-gray-400 print:py-2" />
                  <td className="w-16 border border-gray-200 px-4 py-3 print:border-gray-400 print:py-2" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
