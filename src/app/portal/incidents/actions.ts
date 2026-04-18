'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { createIncident, updateIncident, logAuditEvent } from '@/db'
import { datetimeLocalToUtcIso } from '@/lib/datetime'
import { getUserFriendlyDbError } from '@/lib/db-error'
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

  const { type, parent_notified, parent_notified_at, incident_date, ...rest } =
    parsed.data
  const created_by = session.user.staffId!

  try {
    const incident = await createIncident({
      type,
      ...rest,
      incident_date: datetimeLocalToUtcIso(incident_date),
      created_by,
      parent_notified,
      parent_notified_at:
        parent_notified && parent_notified_at
          ? datetimeLocalToUtcIso(parent_notified_at)
          : null,
    })
    logAuditEvent({
      staffId: created_by,
      action: 'create',
      entity: 'incident',
      entityId: incident.id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/incidents')
  } catch (err) {
    console.error('[createIncidentAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to create incident. Please try again.',
      ),
    }
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

  const { type, parent_notified, parent_notified_at, incident_date, ...rest } =
    parsed.data
  const updated_by = session.user.staffId!

  try {
    await updateIncident(id, {
      ...rest,
      incident_date: datetimeLocalToUtcIso(incident_date),
      updated_by,
      parent_notified,
      parent_notified_at:
        parent_notified && parent_notified_at
          ? datetimeLocalToUtcIso(parent_notified_at)
          : null,
    })
    logAuditEvent({
      staffId: updated_by,
      action: 'update',
      entity: 'incident',
      entityId: id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/incidents')
  } catch (err) {
    console.error('[updateIncidentAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to update incident. Please try again.',
      ),
    }
  }

  redirect(`/portal/incidents?tab=${type}`)
}
