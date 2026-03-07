import { type Metadata } from 'next'

import { getAllStudents, getAllClasses, getAllStaff } from '@/db'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const [students, classes, staff] = await Promise.all([
    getAllStudents() as any, // TODO fix the types here
    getAllClasses() as any,
    getAllStaff() as any,
  ])

  const activeStudents = students.filter((s: any) => s.active)
  const studentsWithAllergies = students.filter((s: any) => s.allergies)
  const teachers = staff.filter((s: any) => s.role === 'teacher')

  const enrolmentByClass = classes.map((cls: any) => ({
    name: cls.name,
    yearGroup: cls.year_group,
    count: activeStudents.filter((s: any) => s.class_id === cls.id).length,
  }))

  const stats = [
    { label: 'Total active students', value: activeStudents.length },
    { label: 'Total classes', value: classes.length },
    { label: 'Teaching staff', value: teachers.length },
    { label: 'Students with allergies', value: studentsWithAllergies.length },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Enrolment by class */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Enrolment by Class</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Year Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Students
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrolmentByClass.map((row: any) => (
              <tr key={row.name} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{row.yearGroup}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
