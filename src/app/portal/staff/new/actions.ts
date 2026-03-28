'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { createStaff, logAuditEvent } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canCreateStaff } from '@/lib/permissions'
import {
  createStaffSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function createStaffAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canCreateStaff(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

  const raw = extractFormFields(formData)
  const parsed = createStaffSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const staff = await createStaff(parsed.data)
    logAuditEvent({
      staffId,
      action: 'create',
      entity: 'staff',
      entityId: staff.id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/staff')
  } catch (err) {
    console.error('[createStaffAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to create staff member. Please try again.',
      ),
    }
  }

  redirect('/portal/staff')
}
