'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { updateStaff } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import {
  updateStaffSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'

export async function updateStaffAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const raw = extractFormFields(formData)
  const parsed = updateStaffSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await updateStaff(id, parsed.data)
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
