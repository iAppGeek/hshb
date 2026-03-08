import { type Metadata } from 'next'

import { getAllStaffWithClasses } from '@/db'

export const metadata: Metadata = { title: 'Staff' }

const roleLabels: Record<string, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  headteacher: 'Headteacher',
}

export default async function StaffPage() {
  const staff = await getAllStaffWithClasses()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
      </div>

      {staff.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No staff found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  First name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Last name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Display name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Room
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {staff.map((member) => {
                const classes = (member.classes as { id: string; name: string; room_number: string | null }[] | null) ?? []
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {member.first_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {member.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {member.display_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {roleLabels[member.role] ?? member.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {member.contact_number ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {classes.length > 0
                        ? classes.map((c) => c.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {classes.length > 0
                        ? classes.map((c) => c.room_number ?? '—').join(', ')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
