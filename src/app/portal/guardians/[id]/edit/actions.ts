'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { updateGuardian } from '@/db'

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim()
  return v || null
}

export async function updateGuardianAction(
  id: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  try {
    await updateGuardian(id, {
      first_name: str(formData, 'first_name')!,
      last_name: str(formData, 'last_name')!,
      phone: str(formData, 'phone')!,
      email: str(formData, 'email'),
      address_line_1: str(formData, 'address_line_1'),
      address_line_2: str(formData, 'address_line_2'),
      city: str(formData, 'city'),
      postcode: str(formData, 'postcode'),
      notes: str(formData, 'notes'),
    })

    revalidatePath('/portal/students')
    revalidatePath(`/portal/guardians/${id}/edit`)
  } catch (err) {
    console.error('[updateGuardianAction] error:', err)
    return { error: 'Failed to save guardian. Please try again.' }
  }

  redirect(`/portal/guardians/${id}/edit`)
}
