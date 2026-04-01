'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

import { auth } from '@/auth'
import {
  createGuardian,
  createStudent,
  getGuardianById,
  logAuditEvent,
} from '@/db'
import { getUserFriendlyDbError } from '@/lib/db-error'
import { canCreateStudents } from '@/lib/permissions'
import {
  createStudentSchema,
  guardianSchema,
  extractFormFields,
  extractGuardianFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

async function resolveGuardian(
  guardian: z.infer<typeof guardianSchema>,
): Promise<string> {
  if (guardian.mode === 'existing') return guardian.existing_id

  const { mode: _, ...data } = guardian
  const created = await createGuardian({
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    email: data.email ?? undefined,
    address_line_1: data.address_line_1 ?? undefined,
    address_line_2: data.address_line_2 ?? undefined,
    city: data.city ?? undefined,
    postcode: data.postcode ?? undefined,
  })
  return created.id
}

export async function createStudentAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { error: 'Not authenticated' }
  const role = session.user.role as StaffRole
  if (!canCreateStudents(role)) return { error: 'Not authorised' }
  const staffId = session.user.staffId ?? null

  const raw = extractFormFields(formData)
  const parsed = createStudentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const primaryRaw = extractGuardianFields(formData, 'primary')
  const primaryParsed = guardianSchema.safeParse(primaryRaw)
  if (!primaryParsed.success)
    return { error: primaryParsed.error.issues[0].message }

  try {
    const primaryGuardianId = await resolveGuardian(primaryParsed.data)

    let secondaryGuardianId: string | null = null
    if (parsed.data.has_secondary) {
      const secondaryRaw = extractGuardianFields(formData, 'secondary')
      const secondaryParsed = guardianSchema.safeParse(secondaryRaw)
      if (!secondaryParsed.success)
        return { error: secondaryParsed.error.issues[0].message }
      secondaryGuardianId = await resolveGuardian(secondaryParsed.data)
    }

    let contact1Id: string | null = null
    if (parsed.data.has_contact1) {
      const contact1Raw = extractGuardianFields(formData, 'contact1')
      const contact1Parsed = guardianSchema.safeParse(contact1Raw)
      if (!contact1Parsed.success)
        return { error: contact1Parsed.error.issues[0].message }
      contact1Id = await resolveGuardian(contact1Parsed.data)
    }

    let contact2Id: string | null = null
    if (parsed.data.has_contact2) {
      const contact2Raw = extractGuardianFields(formData, 'contact2')
      const contact2Parsed = guardianSchema.safeParse(contact2Raw)
      if (!contact2Parsed.success)
        return { error: contact2Parsed.error.issues[0].message }
      contact2Id = await resolveGuardian(contact2Parsed.data)
    }

    const d = parsed.data

    let addressGuardianId: string | null = null
    if (d.address_guardian_id === 'primary') {
      addressGuardianId = primaryGuardianId
    }

    if (addressGuardianId) {
      const guardian = await getGuardianById(addressGuardianId)
      if (!guardian?.address_line_1 || !guardian?.city || !guardian?.postcode) {
        return {
          error:
            'The selected guardian does not have an address. Add their address first.',
        }
      }
    } else if (
      !d.student_address_line_1 ||
      !d.student_city ||
      !d.student_postcode
    ) {
      return {
        error:
          'Enter an address or select a guardian whose address the student shares',
      }
    }

    const student = await createStudent({
      first_name: d.student_first_name,
      last_name: d.student_last_name,
      student_code: d.student_code,
      date_of_birth: d.student_date_of_birth,
      address_guardian_id: addressGuardianId,
      address_line_1: addressGuardianId ? null : d.student_address_line_1,
      address_line_2: addressGuardianId ? null : d.student_address_line_2,
      city: addressGuardianId ? null : d.student_city,
      postcode: addressGuardianId ? null : d.student_postcode,
      allergies: d.student_allergies,
      medical_details: d.student_medical_details,
      notes: d.student_notes,
      primary_guardian_id: primaryGuardianId,
      primary_guardian_relationship: d.primary_relationship,
      secondary_guardian_id: secondaryGuardianId,
      secondary_guardian_relationship: secondaryGuardianId
        ? (d.secondary_relationship ?? null)
        : null,
      additional_contact_1_id: contact1Id,
      additional_contact_1_relationship: contact1Id
        ? (d.contact1_relationship ?? null)
        : null,
      additional_contact_2_id: contact2Id,
      additional_contact_2_relationship: contact2Id
        ? (d.contact2_relationship ?? null)
        : null,
    })

    logAuditEvent({
      staffId,
      action: 'create',
      entity: 'student',
      entityId: student.id,
      details: parsed.data as Record<string, unknown>,
    })
    revalidatePath('/portal/students')
  } catch (err) {
    console.error('[createStudentAction] error:', err)
    return {
      error: getUserFriendlyDbError(
        err,
        'Failed to save student. Please try again.',
      ),
    }
  }

  redirect('/portal/students')
}
