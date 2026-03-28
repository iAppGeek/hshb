'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { createClass, setClassStudents, logAuditEvent } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canCreateClasses } from '@/lib/permissions'
import {
  createClassSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function createClassAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canCreateClasses(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

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
    logAuditEvent({
      staffId,
      action: 'create',
      entity: 'class',
      entityId: cls.id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/classes')
  } catch (err) {
    console.error('[createClassAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to create class. Please try again.',
      ),
    }
  }

  redirect('/portal/classes')
}
