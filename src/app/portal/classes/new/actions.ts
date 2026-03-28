'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClass, setClassStudents } from '@/db'
import {
  createClassSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'

export async function createClassAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = extractFormFields(formData, ['student_ids'])
  const parsed = createClassSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { student_ids, ...classData } = parsed.data

  try {
    const cls = await createClass({
      name: classData.name,
      year_group: classData.year_group,
      room_number: classData.room_number,
      academic_year: classData.academic_year ?? undefined,
      teacher_id: classData.teacher_id,
    })

    await setClassStudents(cls.id, student_ids)
    revalidatePath('/portal/classes')
  } catch (err) {
    console.error('[createClassAction] error:', err)
    return { error: 'Failed to create class. Please try again.' }
  }

  redirect('/portal/classes')
}
