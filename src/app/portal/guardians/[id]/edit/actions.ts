'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { updateGuardian, logAuditEvent } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canEditGuardians } from '@/lib/permissions'
import {
  updateGuardianSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function updateGuardianAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canEditGuardians(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

  const raw = extractFormFields(formData)
  const parsed = updateGuardianSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await updateGuardian(id, parsed.data)
    logAuditEvent({
      staffId,
      action: 'update',
      entity: 'guardian',
      entityId: id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/students')
    revalidatePath(`/portal/guardians/${id}/edit`)
  } catch (err) {
    console.error('[updateGuardianAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to save guardian. Please try again.',
      ),
    }
  }

  redirect(`/portal/guardians/${id}/edit`)
}
