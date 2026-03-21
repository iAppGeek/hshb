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

const TH =
  'px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6'
const TD = 'hidden px-3 py-4 text-sm text-gray-500 sm:table-cell sm:px-6'

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      Inactive
    </span>
  )
}

export default function ClassesTable({ classes, canEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="hidden bg-gray-50 sm:table-header-group">
            <tr>
              <th className={TH}>Name</th>
              <th className={TH}>Year Group</th>
              <th className={TH}>Room</th>
              <th className={TH}>Teacher</th>
              <th className={TH}>Academic Year</th>
              <th className={TH}>Status</th>
              <th className={TH}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {classes.map((cls) => {
              const teacherName = cls.teacher
                ? `${cls.teacher.last_name}, ${cls.teacher.first_name}`
                : '—'

              return (
                <tr
                  key={cls.id}
                  className="block border-b border-gray-200 last:border-0 hover:bg-gray-50 sm:table-row sm:border-0"
                >
                  {/* Name — on mobile: name + status left, Edit link right */}
                  <td className="block px-4 pt-4 pb-0 text-sm font-medium text-gray-900 sm:table-cell sm:px-6 sm:py-4 sm:whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:block">
                      {cls.name}
                      <span className="sm:hidden">
                        <StatusBadge active={cls.active} />
                      </span>
                      {canEdit && (
                        <Link
                          href={`/portal/classes/${cls.id}/edit`}
                          className="ml-auto shrink-0 text-sm text-gray-500 hover:text-gray-700 sm:hidden"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>

                  {/* Mobile secondary: other fields + Details link */}
                  <td className="block px-4 py-2 text-xs text-gray-500 sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="block">
                          {cls.room_number ?? '—'}
                          {' · '}
                          {teacherName}
                        </span>
                        <span className="block">
                          {cls.academic_year ?? '—'}
                        </span>
                      </div>
                      <Link
                        href={`/portal/classes/${cls.id}`}
                        className="shrink-0 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </Link>
                    </div>
                  </td>

                  {/* Desktop-only columns */}
                  <td className={TD}>{cls.year_group}</td>
                  <td className={TD}>{cls.room_number ?? '—'}</td>
                  <td className={TD}>{teacherName}</td>
                  <td className={TD}>{cls.academic_year ?? '—'}</td>
                  <td className="hidden px-3 py-4 text-sm sm:table-cell sm:px-6">
                    <StatusBadge active={cls.active} />
                  </td>
                  <td className="hidden px-3 py-4 text-right text-sm font-medium sm:table-cell sm:px-6">
                    <div className="flex items-center justify-end gap-3">
                      {canEdit && (
                        <Link
                          href={`/portal/classes/${cls.id}/edit`}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Edit
                        </Link>
                      )}
                      <Link
                        href={`/portal/classes/${cls.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
