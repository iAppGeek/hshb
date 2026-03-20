'use client'

import { useState, useMemo } from 'react'
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
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return students
    return students.filter((s) => {
      const name =
        `${s.first_name} ${s.last_name} ${s.last_name}, ${s.first_name}`.toLowerCase()
      const code = (s.student_code ?? '').toLowerCase()
      const guardian = s.primary_guardian
        ? `${s.primary_guardian.first_name} ${s.primary_guardian.last_name}`.toLowerCase()
        : ''
      return name.includes(q) || code.includes(q) || guardian.includes(q)
    })
  }, [students, query])

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:max-w-xs"
        />
      </div>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="hidden bg-gray-50 sm:table-header-group">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Code
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Classes
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                  Primary Guardian
                </th>
                <th className="relative px-3 py-3 sm:px-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map((student) => {
                const classNames =
                  student.student_classes
                    .map((sc) => sc.class?.name)
                    .filter(Boolean)
                    .join(', ') || '—'
                const guardianName = student.primary_guardian
                  ? `${student.primary_guardian.first_name} ${student.primary_guardian.last_name}`
                  : '—'

                return (
                  <tr
                    key={student.id}
                    className="block border-b border-gray-200 last:border-0 hover:bg-gray-50 sm:table-row sm:border-0"
                  >
                    {/* Name — on mobile: name left, Edit link right */}
                    <td className="block px-4 pt-4 pb-0 text-sm font-medium text-gray-900 sm:table-cell sm:px-6 sm:py-4 sm:whitespace-nowrap">
                      <div className="flex items-center justify-between gap-2 sm:block">
                        <span>
                          {student.last_name}, {student.first_name}
                        </span>
                        {role === 'admin' && (
                          <Link
                            href={`/portal/students/${student.id}/edit`}
                            className="shrink-0 text-sm text-gray-500 hover:text-gray-700 sm:hidden"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>

                    {/* Mobile secondary: code · classes · guardian + Details button */}
                    <td className="block px-4 py-2 text-xs text-gray-500 sm:hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span>
                          {student.student_code ?? '—'}
                          {' · '}
                          {classNames}
                          {' · '}
                          {guardianName}
                        </span>
                        <button
                          onClick={() => setSelected(student)}
                          className="shrink-0 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Details
                        </button>
                      </div>
                    </td>

                    {/* Desktop-only columns */}
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
                      {student.student_code ?? '—'}
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
                      {classNames}
                    </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
                      {guardianName}
                    </td>
                    <td className="hidden px-3 py-4 text-right text-sm font-medium sm:table-cell sm:px-6">
                      <div className="flex items-center justify-end gap-3">
                        {role === 'admin' && (
                          <Link
                            href={`/portal/students/${student.id}/edit`}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Edit
                          </Link>
                        )}
                        <button
                          onClick={() => setSelected(student)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
