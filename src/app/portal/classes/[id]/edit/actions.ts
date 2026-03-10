'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { updateClass, setClassStudents } from '@/db'

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim()
  return v || null
}

export async function updateClassAction(
  id: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  try {
    await updateClass(id, {
      name: str(formData, 'name')!,
      year_group: str(formData, 'year_group')!,
      room_number: str(formData, 'room_number'),
      academic_year: str(formData, 'academic_year') ?? undefined,
      teacher_id: str(formData, 'teacher_id')!,
      active: formData.get('active') === 'true',
    })

    const studentIds = (formData.getAll('student_ids') as string[]).filter(
      Boolean,
    )
    await setClassStudents(id, studentIds)

    revalidatePath('/portal/classes')
  } catch (err) {
    console.error('[updateClassAction] error:', err)
    return { error: 'Failed to update class. Please try again.' }
  }

  redirect('/portal/classes')
}
