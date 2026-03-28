'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { updateStaff, logAuditEvent } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canEditStaff } from '@/lib/permissions'
import {
  updateStaffSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function updateStaffAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canEditStaff(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

  const raw = extractFormFields(formData)
  const parsed = updateStaffSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await updateStaff(id, parsed.data)
    logAuditEvent({
      staffId,
      action: 'update',
      entity: 'staff',
      entityId: id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/staff')
  } catch (err) {
    console.error('[updateStaffAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to update staff member. Please try again.',
      ),
    }
  }

  redirect('/portal/staff')
}
