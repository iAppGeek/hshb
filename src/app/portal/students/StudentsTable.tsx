'use client'

import { useState } from 'react'

import StudentDetailsModal, {
  type StudentForModal,
} from '@/components/StudentDetailsModal'
import type { StaffRole } from '@/types/next-auth'

type Student = StudentForModal & {
  student_code: string | null
  student_classes: Array<{
    class: { id: string; name: string; year_group: string } | null
  }>
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
                Classes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Guardian
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Details</span>
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
                  {student.student_classes
                    .map((sc) => sc.class?.name)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {student.primary_guardian
                    ? `${student.primary_guardian.first_name} ${student.primary_guardian.last_name}`
                    : '—'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => setSelected(student)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
