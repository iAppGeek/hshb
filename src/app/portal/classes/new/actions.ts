'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClass, setClassStudents } from '@/db'

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim()
  return v || null
}

export async function createClassAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  try {
    const cls = await createClass({
      name: str(formData, 'name')!,
      year_group: str(formData, 'year_group')!,
      room_number: str(formData, 'room_number'),
      academic_year: str(formData, 'academic_year') ?? undefined,
      teacher_id: str(formData, 'teacher_id')!,
    })

    const studentIds = (formData.getAll('student_ids') as string[]).filter(
      Boolean,
    )
    await setClassStudents(cls.id, studentIds)

    revalidatePath('/portal/classes')
  } catch {
    return { error: 'Failed to create class. Please try again.' }
  }

  redirect('/portal/classes')
}
