'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { createIncident, updateIncident } from '@/db'
import type { IncidentType } from '@/db'
import { canEditIncidents } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

function str(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() ?? ''
}

export async function createIncidentAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session) return { error: 'Unauthorised' }

  const type = str(formData, 'type') as IncidentType
  const student_id = str(formData, 'student_id')
  const title = str(formData, 'title')
  const description = str(formData, 'description')
  const incident_date = str(formData, 'incident_date')
  const created_by = session.user.staffId!
  const parent_notified = formData.get('parent_notified') === 'true'
  const parent_notified_at = parent_notified
    ? str(formData, 'parent_notified_at') || null
    : null

  try {
    await createIncident({
      type,
      student_id,
      title,
      description,
      incident_date,
      created_by,
      parent_notified,
      parent_notified_at,
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
): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session || !canEditIncidents(session.user.role as StaffRole))
    return { error: 'Unauthorised' }

  const type = str(formData, 'type') as IncidentType
  const title = str(formData, 'title')
  const description = str(formData, 'description')
  const incident_date = str(formData, 'incident_date')
  const updated_by = session.user.staffId!
  const parent_notified = formData.get('parent_notified') === 'true'
  const parent_notified_at = parent_notified
    ? str(formData, 'parent_notified_at') || null
    : null

  try {
    await updateIncident(id, {
      title,
      description,
      incident_date,
      updated_by,
      parent_notified,
      parent_notified_at,
    })
    revalidatePath('/portal/incidents')
  } catch (err) {
    console.error('[updateIncidentAction] error:', err)
    return { error: 'Failed to update incident. Please try again.' }
  }

  redirect(`/portal/incidents?tab=${type}`)
}
