import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getIncidentById } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import EditIncidentForm from './EditIncidentForm'

export const metadata: Metadata = { title: 'Edit Incident' }

export default async function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const role = session?.user?.role as StaffRole

  if (role === 'teacher') {
    redirect('/portal/incidents')
  }

  const { id } = await params
  const incident = await getIncidentById(id)

  if (!incident) {
    redirect('/portal/incidents')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Incident</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>
      <EditIncidentForm incident={incident} />
    </div>
  )
}
