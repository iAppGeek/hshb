import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getClassById, getTeachers, getStudentsForList } from '@/db'
import { canEditClasses } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import ClassForm, {
  type ClassFormTeacher,
  type ClassFormStudent,
  type ClassFormData,
} from '../../ClassForm'

import { updateClassAction } from './actions'

export const metadata: Metadata = { title: 'Edit Class' }

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const role = session?.user?.role as StaffRole

  if (!canEditClasses(role)) {
    redirect('/portal/classes')
  }

  const { id } = await params

  const [classData, teachers, students] = await Promise.all([
    getClassById(id),
    getTeachers(),
    getStudentsForList(),
  ])

  if (!classData) {
    redirect('/portal/classes')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Class: {classData.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <ClassForm
        teachers={teachers as ClassFormTeacher[]}
        students={students as ClassFormStudent[]}
        classData={classData as ClassFormData}
        action={updateClassAction.bind(null, id)}
        submitLabel="Save changes"
      />
    </div>
  )
}
