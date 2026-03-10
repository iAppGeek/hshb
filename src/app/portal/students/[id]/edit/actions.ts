'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createGuardian, updateStudent, updateStudentClasses } from '@/db'

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim()
  return v || null
}

async function resolveGuardian(
  formData: FormData,
  prefix: string,
  opts: { email?: boolean; address?: boolean } = {},
): Promise<string> {
  if (formData.get(`${prefix}_mode`) === 'existing') {
    return str(formData, `${prefix}_existing_id`)!
  }

  const guardian = await createGuardian({
    first_name: str(formData, `${prefix}_first_name`)!,
    last_name: str(formData, `${prefix}_last_name`)!,
    phone: str(formData, `${prefix}_phone`)!,
    email: opts.email ? str(formData, `${prefix}_email`) : undefined,
    ...(opts.address && {
      address_line_1: str(formData, `${prefix}_address_line_1`),
      address_line_2: str(formData, `${prefix}_address_line_2`),
      city: str(formData, `${prefix}_city`),
      postcode: str(formData, `${prefix}_postcode`),
    }),
  })

  return guardian.id
}

export async function updateStudentAction(
  id: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  try {
    const primaryGuardianId = await resolveGuardian(formData, 'primary', {
      email: true,
      address: true,
    })

    let secondaryGuardianId: string | null = null
    if (formData.get('has_secondary') === 'true') {
      secondaryGuardianId = await resolveGuardian(formData, 'secondary', {
        email: true,
        address: true,
      })
    }

    let contact1Id: string | null = null
    if (formData.get('has_contact1') === 'true') {
      contact1Id = await resolveGuardian(formData, 'contact1')
    }

    let contact2Id: string | null = null
    if (formData.get('has_contact2') === 'true') {
      contact2Id = await resolveGuardian(formData, 'contact2')
    }

    await updateStudent(id, {
      first_name: str(formData, 'student_first_name')!,
      last_name: str(formData, 'student_last_name')!,
      student_code: str(formData, 'student_code'),
      date_of_birth: str(formData, 'student_date_of_birth'),
      address_line_1: str(formData, 'student_address_line_1')!,
      address_line_2: str(formData, 'student_address_line_2'),
      city: str(formData, 'student_city')!,
      postcode: str(formData, 'student_postcode')!,
      allergies: str(formData, 'student_allergies'),
      medical_details: str(formData, 'student_medical_details'),
      notes: str(formData, 'student_notes'),
      primary_guardian_id: primaryGuardianId,
      primary_guardian_relationship: str(formData, 'primary_relationship'),
      secondary_guardian_id: secondaryGuardianId,
      secondary_guardian_relationship: secondaryGuardianId
        ? str(formData, 'secondary_relationship')
        : null,
      additional_contact_1_id: contact1Id,
      additional_contact_1_relationship: contact1Id
        ? str(formData, 'contact1_relationship')
        : null,
      additional_contact_2_id: contact2Id,
      additional_contact_2_relationship: contact2Id
        ? str(formData, 'contact2_relationship')
        : null,
    })

    const classIds = formData.getAll('class_ids') as string[]
    await updateStudentClasses(id, classIds)

    revalidatePath('/portal/students')
  } catch (err) {
    console.error('[updateStudentAction] error:', err)
    return { error: 'Failed to save student. Please try again.' }
  }

  redirect('/portal/students')
}
