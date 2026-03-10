import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getStudentById, getAllGuardians, getAllClasses } from '@/db'
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

  const [student, guardians, classes] = await Promise.all([
    getStudentById(id),
    getAllGuardians(),
    getAllClasses(),
  ])

  if (!student) {
    redirect('/portal/students')
  }

  const enrolledClassIds = (
    student.student_classes as Array<{ class: { id: string } | null }>
  )
    .map((sc) => sc.class?.id)
    .filter((id): id is string => Boolean(id))

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
        guardians={guardians}
        classes={classes as { id: string; name: string; year_group: string }[]}
        enrolledClassIds={enrolledClassIds}
      />
    </div>
  )
}
