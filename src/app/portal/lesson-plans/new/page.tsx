import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllClasses, getClassesByTeacher } from '@/db'
import { isTeacher, canCreateLessonPlans } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import AddLessonPlanForm from './AddLessonPlanForm'

export const metadata: Metadata = { title: 'Add Lesson Plan' }

export default async function AddLessonPlanPage() {
  const session = await auth()
  if (!session) redirect('/portal/login')

  const role = session.user.role as StaffRole
  if (!canCreateLessonPlans(role)) redirect('/portal/lesson-plans')

  const staffId = session.user.staffId!
  const classes = isTeacher(role)
    ? await getClassesByTeacher(staffId)
    : await getAllClasses()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Lesson Plan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>
      <AddLessonPlanForm classes={classes} />
    </div>
  )
}
