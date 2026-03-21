import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getLessonPlanById, getClassesByTeacher } from '@/db'
import { canEditLessonPlans, isTeacher } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import EditLessonPlanForm from './EditLessonPlanForm'

export const metadata: Metadata = { title: 'Edit Lesson Plan' }

export default async function EditLessonPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/portal/login')

  const role = session.user.role as StaffRole
  if (!canEditLessonPlans(role)) redirect('/portal/lesson-plans')

  const { id } = await params
  const plan = await getLessonPlanById(id)
  if (!plan) redirect('/portal/lesson-plans')

  if (isTeacher(role)) {
    const classes = await getClassesByTeacher(session.user.staffId!)
    if (!classes.some((c) => c.id === plan.class_id)) {
      redirect('/portal/lesson-plans')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Lesson Plan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>
      <EditLessonPlanForm plan={plan} />
    </div>
  )
}
