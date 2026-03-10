import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getTeachers, getAllStudents } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import ClassForm, {
  type ClassFormTeacher,
  type ClassFormStudent,
} from '../ClassForm'

import { createClassAction } from './actions'

export const metadata: Metadata = { title: 'Add Class' }

export default async function AddClassPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole

  if (role === 'admin' || role === 'headteacher') {
    // authorised — continue
  } else {
    redirect('/portal/classes')
  }

  const [teachers, students] = await Promise.all([
    getTeachers(),
    getAllStudents(),
  ])

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Class</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <ClassForm
        teachers={teachers as ClassFormTeacher[]}
        students={students as ClassFormStudent[]}
        action={createClassAction}
        submitLabel="Add Class"
      />
    </div>
  )
}
