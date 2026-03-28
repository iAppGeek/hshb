'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { updateGuardian } from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import {
  updateGuardianSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'

export async function updateGuardianAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const raw = extractFormFields(formData)
  const parsed = updateGuardianSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await updateGuardian(id, parsed.data)
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
