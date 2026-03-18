import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllStaffWithClasses } from '@/db'
import type { StaffRole } from '@/types/next-auth'

export const metadata: Metadata = { title: 'Staff' }

const roleLabels: Record<string, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  headteacher: 'Headteacher',
}

export default async function StaffPage() {
  const session = await auth()
  if (!session) {
    redirect('/portal/login')
  }

  const role = session.user?.role as StaffRole
  const isAdmin = role === 'admin'
  const canSeeContact = role === 'admin' || role === 'headteacher'

  const staffRaw = await getAllStaffWithClasses()

  const staff = [...staffRaw].sort((a, b) => {
    const aName = (
      (a.classes as { name: string }[] | null)?.[0]?.name ?? ''
    ).toLowerCase()
    const bName = (
      (b.classes as { name: string }[] | null)?.[0]?.name ?? ''
    ).toLowerCase()
    if (aName === '' && bName === '') return 0
    if (aName === '') return 1
    if (bName === '') return -1
    return aName.localeCompare(bName)
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        {isAdmin && (
          <Link
            href="/portal/staff/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Add Staff
          </Link>
        )}
      </div>

      {staff.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No staff found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                    First name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                    Last name
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:table-cell sm:px-6">
                    Display name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                    Role
                  </th>
                  {canSeeContact && (
                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase md:table-cell md:px-6">
                      Contact
                    </th>
                  )}
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                    Class
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                    Room
                  </th>
                  {isAdmin && (
                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:px-6">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {staff.map((member) => {
                  const classes =
                    (member.classes as
                      | {
                          id: string
                          name: string
                          room_number: string | null
                        }[]
                      | null) ?? []
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm font-medium text-gray-900 sm:px-6">
                        {member.first_name}
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-gray-900 sm:px-6">
                        {member.last_name}
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
                        {member.display_name ?? '—'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                        {roleLabels[member.role] ?? member.role}
                      </td>
                      {canSeeContact && (
                        <td className="hidden px-3 py-4 text-sm text-gray-500 md:table-cell md:px-6">
                          {member.contact_number ?? '—'}
                        </td>
                      )}
                      <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                        {classes.length > 0
                          ? classes.map((c) => c.name).join(', ')
                          : '—'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                        {classes.length > 0
                          ? classes.map((c) => c.room_number ?? '—').join(', ')
                          : '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-3 py-4 text-sm sm:px-6">
                          <Link
                            href={`/portal/staff/${member.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Link>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
