'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import {
  createLessonPlan,
  updateLessonPlan,
  getLessonPlanById,
  getClassesByTeacher,
} from '@/db'
import {
  canCreateLessonPlans,
  canEditLessonPlans,
  isTeacher,
} from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

function str(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() ?? ''
}

export async function createLessonPlanAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session) return { error: 'Unauthorised' }

  const role = session.user.role as StaffRole
  if (!canCreateLessonPlans(role)) return { error: 'Unauthorised' }

  const class_id = str(formData, 'class_id')
  const lesson_date = str(formData, 'lesson_date')
  const description = str(formData, 'description')
  const created_by = session.user.staffId!

  if (isTeacher(role)) {
    const classes = await getClassesByTeacher(created_by)
    if (!classes.some((c) => c.id === class_id)) {
      return { error: 'You can only create lesson plans for your own class.' }
    }
  }

  try {
    await createLessonPlan({ class_id, lesson_date, description, created_by })
    revalidatePath('/portal/lesson-plans')
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === '23505') {
      return {
        error: 'A lesson plan already exists for this class on this date.',
      }
    }
    console.error('[createLessonPlanAction] error:', err)
    return { error: 'Failed to create lesson plan. Please try again.' }
  }

  redirect('/portal/lesson-plans')
}

export async function updateLessonPlanAction(
  id: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session) return { error: 'Unauthorised' }

  const role = session.user.role as StaffRole
  if (!canEditLessonPlans(role)) return { error: 'Unauthorised' }

  const staffId = session.user.staffId!

  if (isTeacher(role)) {
    const plan = await getLessonPlanById(id)
    if (!plan) return { error: 'Lesson plan not found.' }
    const classes = await getClassesByTeacher(staffId)
    if (!classes.some((c) => c.id === plan.class_id)) {
      return { error: 'You can only edit lesson plans for your own class.' }
    }
  }

  const lesson_date = str(formData, 'lesson_date')
  const description = str(formData, 'description')
  const updated_by = staffId

  try {
    await updateLessonPlan(id, { lesson_date, description, updated_by })
    revalidatePath('/portal/lesson-plans')
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === '23505') {
      return {
        error: 'A lesson plan already exists for this class on this date.',
      }
    }
    console.error('[updateLessonPlanAction] error:', err)
    return { error: 'Failed to update lesson plan. Please try again.' }
  }

  redirect('/portal/lesson-plans')
}
