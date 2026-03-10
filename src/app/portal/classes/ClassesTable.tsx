'use client'

import Link from 'next/link'

type Teacher = {
  first_name: string
  last_name: string
} | null

export type ClassRow = {
  id: string
  name: string
  year_group: string
  room_number: string | null
  academic_year: string | null
  active: boolean
  teacher: Teacher
}

type Props = {
  classes: ClassRow[]
  canEdit: boolean
}

export default function ClassesTable({ classes, canEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Year Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Academic Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {cls.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cls.year_group}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cls.room_number ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cls.teacher
                    ? `${cls.teacher.last_name}, ${cls.teacher.first_name}`
                    : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cls.academic_year ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {cls.active ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/portal/classes/${cls.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Details
                    </Link>
                    {canEdit && (
                      <Link
                        href={`/portal/classes/${cls.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
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
  )
}
