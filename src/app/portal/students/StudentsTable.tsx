'use client'

import { useState } from 'react'
import Link from 'next/link'

import StudentDetailsModal, {
  type StudentForModal,
} from '@/components/StudentDetailsModal'
import type { StaffRole } from '@/types/next-auth'

type Student = StudentForModal & {
  student_code: string | null
}

type Props = {
  students: Student[]
  role: StaffRole
}

export default function StudentsTable({ students, role }: Props) {
  const [selected, setSelected] = useState<Student | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Name
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:table-cell sm:px-6">
                  Code
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Classes
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Guardian
                </th>
                <th className="relative px-3 py-3 sm:px-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm font-medium text-gray-900 sm:px-6">
                    {student.last_name}, {student.first_name}
                  </td>
                  <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
                    {student.student_code ?? '—'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                    {student.student_classes
                      .map((sc) => sc.class?.name)
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                    {student.primary_guardian
                      ? `${student.primary_guardian.first_name} ${student.primary_guardian.last_name}`
                      : '—'}
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium sm:px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelected(student)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                      {role === 'admin' && (
                        <Link
                          href={`/portal/students/${student.id}/edit`}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <StudentDetailsModal
          student={selected}
          role={role}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
