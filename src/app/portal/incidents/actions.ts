'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { createIncident, updateIncident } from '@/db'
import { canEditIncidents } from '@/lib/permissions'
import {
  createIncidentSchema,
  updateIncidentSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

export async function createIncidentAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Unauthorised' }

  const raw = extractFormFields(formData)
  const parsed = createIncidentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { type, parent_notified, parent_notified_at, ...rest } = parsed.data
  const created_by = session.user.staffId!

  try {
    await createIncident({
      type,
      ...rest,
      created_by,
      parent_notified,
      parent_notified_at: parent_notified ? parent_notified_at : null,
    })
    revalidatePath('/portal/incidents')
  } catch (err) {
    console.error('[createIncidentAction] error:', err)
    return { error: 'Failed to create incident. Please try again.' }
  }

  redirect(`/portal/incidents?tab=${type}`)
}

export async function updateIncidentAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session || !canEditIncidents(session.user.role as StaffRole))
    return { error: 'Unauthorised' }

  const raw = extractFormFields(formData)
  const parsed = updateIncidentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { type, parent_notified, parent_notified_at, ...rest } = parsed.data
  const updated_by = session.user.staffId!

  try {
    await updateIncident(id, {
      ...rest,
      updated_by,
      parent_notified,
      parent_notified_at: parent_notified ? parent_notified_at : null,
    })
    revalidatePath('/portal/incidents')
  } catch (err) {
    console.error('[updateIncidentAction] error:', err)
    return { error: 'Failed to update incident. Please try again.' }
  }

  redirect(`/portal/incidents?tab=${type}`)
}
