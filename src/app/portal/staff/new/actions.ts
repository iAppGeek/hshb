'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createStaff } from '@/db'
import {
  createStaffSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'

export async function createStaffAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = extractFormFields(formData)
  const parsed = createStaffSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await createStaff(parsed.data)
    revalidatePath('/portal/staff')
  } catch (err) {
    console.error('[createStaffAction] error:', err)
    return { error: 'Failed to create staff member. Please try again.' }
  }

  redirect('/portal/staff')
}
