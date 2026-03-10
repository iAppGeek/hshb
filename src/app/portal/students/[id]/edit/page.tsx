import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getStudentById, getAllClasses, getAllGuardians } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import EditStudentForm from './EditStudentForm'

export const metadata: Metadata = { title: 'Edit Student' }

export default async function EditStudentPage({
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

  const [student, classes, guardians] = await Promise.all([
    getStudentById(id),
    getAllClasses(),
    getAllGuardians(),
  ])

  if (!student) {
    redirect('/portal/students')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Student: {student.last_name}, {student.first_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <EditStudentForm
        student={student}
        classes={classes}
        guardians={guardians}
      />
    </div>
  )
}
