'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createStaff } from '@/db'

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim()
  return v || null
}

export async function createStaffAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  try {
    await createStaff({
      first_name: str(formData, 'first_name')!,
      last_name: str(formData, 'last_name')!,
      email: str(formData, 'email')!,
      role: str(formData, 'role')!,
      display_name: str(formData, 'display_name'),
      contact_number: str(formData, 'contact_number'),
    })

    revalidatePath('/portal/staff')
  } catch {
    return { error: 'Failed to create staff member. Please try again.' }
  }

  redirect('/portal/staff')
}
