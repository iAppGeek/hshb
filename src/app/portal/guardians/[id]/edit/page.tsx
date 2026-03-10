import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getGuardianById, getStudentsByGuardian } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import EditGuardianForm from './EditGuardianForm'

export const metadata: Metadata = { title: 'Edit Guardian' }

export default async function EditGuardianPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const role = session?.user?.role as StaffRole

  if (role === 'admin') {
    // authorised — continue
  } else {
    redirect('/portal/students')
  }

  const { id } = await params

  const [guardian, linkedStudents] = await Promise.all([
    getGuardianById(id),
    getStudentsByGuardian(id),
  ])

  if (!guardian) {
    redirect('/portal/students')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Guardian: {guardian.last_name}, {guardian.first_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <EditGuardianForm guardian={guardian} linkedStudents={linkedStudents} />
    </div>
  )
}
