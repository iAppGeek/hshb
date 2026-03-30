'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { migrateClass, logAuditEvent } from '@/db'
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

  const { data, error } = await migrateClass(source_class_id, newClassData)

  if (error) return { error: error.message }

  logAuditEvent({
    staffId,
    action: 'create',
    entity: 'class',
    entityId: data?.new_class_id ?? source_class_id,
    details: parsed.data as Record<string, unknown>,
  })
  revalidatePath('/portal/admin')

  redirect('/portal/admin')
}
