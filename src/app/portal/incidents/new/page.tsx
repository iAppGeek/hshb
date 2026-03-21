import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getStudentsForList, getStudentsByTeacher } from '@/db'
import type { IncidentType } from '@/db'
import { isTeacher } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import AddIncidentForm from './AddIncidentForm'

export const metadata: Metadata = { title: 'Add Incident' }

export default async function AddIncidentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/portal/login')

  const role = session.user.role as StaffRole
  const staffId = session.user.staffId!
  const { type } = await searchParams
  const incidentType: IncidentType =
    type === 'behaviour' ? 'behaviour' : 'medical'

  const students = isTeacher(role)
    ? await getStudentsByTeacher(staffId)
    : await getStudentsForList()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Incident</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>
      <AddIncidentForm
        students={students}
        staffId={staffId}
        type={incidentType}
      />
    </div>
  )
}
