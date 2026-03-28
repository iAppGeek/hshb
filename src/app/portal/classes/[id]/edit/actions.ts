'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { updateClass, setClassStudents, logAuditEvent } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canEditClasses } from '@/lib/permissions'
import {
  updateClassSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function updateClassAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canEditClasses(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

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
    logAuditEvent({
      staffId,
      action: 'update',
      entity: 'class',
      entityId: id,
      details: parsed.data as Record<string, unknown>,
    })
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
