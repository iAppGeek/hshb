'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { migrateClass, logAuditEvent } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canMigrateClasses } from '@/lib/permissions'
import {
  migrateClassSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function migrateClassAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canMigrateClasses(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

  const raw = extractFormFields(formData)
  const parsed = migrateClassSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { source_class_id, ...newClassData } = parsed.data

  try {
    const result = await migrateClass(source_class_id, newClassData)

    logAuditEvent({
      staffId,
      action: 'create',
      entity: 'class',
      entityId: result.new_class_id,
      details: parsed.data as Record<string, unknown>,
    })
    logAuditEvent({
      staffId,
      action: 'update',
      entity: 'class',
      entityId: source_class_id,
      details: { migrated_to: result.new_class_id, deactivated: true },
    })
    revalidatePath('/portal/admin')
  } catch (err) {
    console.error('[migrateClassAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to migrate class. Please try again.',
      ),
    }
  }

  redirect('/portal/admin')
}
