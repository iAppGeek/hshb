'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { updateClass, setClassStudents } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import {
  updateClassSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'

export async function updateClassAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const raw = extractFormFields(formData, ['student_ids'])
  const parsed = updateClassSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { student_ids, active, ...classData } = parsed.data

  try {
    await updateClass(id, {
      name: classData.name,
      year_group: classData.year_group,
      room_number: classData.room_number,
      academic_year: classData.academic_year ?? undefined,
      teacher_id: classData.teacher_id,
      active,
    })

    await setClassStudents(id, student_ids)
    revalidatePath('/portal/classes')
  } catch (err) {
    console.error('[updateClassAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to update class. Please try again.',
      ),
    }
  }

  redirect('/portal/classes')
}
