import { unstable_cache, revalidateTag } from 'next/cache'
import type { PostgrestError } from '@supabase/supabase-js'

import { supabase } from './client'

const CLASS_SELECT =
  '*, teacher:staff(id, first_name, last_name, display_name, email)'

const OPTS = { revalidate: 60, tags: ['classes'] }

export const getAllClasses = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('classes')
      .select(CLASS_SELECT)
      .eq('active', true)
      .order('year_group')
    return data ?? []
  },
  ['all-classes'],
  OPTS,
)

export const getAllClassesIncludingInactive = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('classes')
      .select(CLASS_SELECT)
      .order('year_group')
    return data ?? []
  },
  ['all-classes-including-inactive'],
  OPTS,
)

export const getClassById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from('classes')
      .select(`${CLASS_SELECT}, student_classes(student_id)`)
      .eq('id', id)
      .single()
    return data
  },
  ['class-by-id'],
  OPTS,
)

export const getClassesByTeacher = unstable_cache(
  async (teacherId: string) => {
    const { data } = await supabase
      .from('classes')
      .select(CLASS_SELECT)
      .eq('teacher_id', teacherId)
      .eq('active', true)
      .order('year_group')
    return data ?? []
  },
  ['classes-by-teacher'],
  OPTS,
)

export const getClassWithStudents = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from('classes')
      .select(
        `*, teacher:staff(first_name, last_name, display_name, contact_number),
      student_classes(
        student:students(
          id, first_name, last_name, allergies,
          primary_guardian:guardians!students_primary_guardian_id_fkey(first_name, last_name, phone)
        )
      )`,
      )
      .eq('id', id)
      .single()
    return data
  },
  ['class-with-students'],
  { revalidate: 60, tags: ['classes', 'students'] },
)

export const getEnrollmentCountsByClass = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const { data } = await supabase
      .from('student_classes')
      .select('class_id, students!inner(active)')
      .eq('students.active', true)
    if (!data) return {}
    const result: Record<string, number> = {}
    for (const row of data) {
      result[row.class_id] = (result[row.class_id] ?? 0) + 1
    }
    return result
  },
  ['enrollment-counts-by-class'],
  { revalidate: 60, tags: ['classes', 'students'] },
)

type ClassInsert = {
  name: string
  year_group: string
  room_number?: string | null
  academic_year?: string
  teacher_id: string
  active?: boolean
}

export async function createClass(data: ClassInsert) {
  const { data: cls, error } = await supabase
    .from('classes')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  revalidateTag('classes', 'max')
  return cls
}

export async function updateClass(
  id: string,
  data: Partial<ClassInsert> & { active?: boolean },
) {
  const { error } = await supabase.from('classes').update(data).eq('id', id)
  if (error) throw error
  revalidateTag('classes', 'max')
  revalidateTag('students', 'max')
}

type MigrateClassInput = {
  name: string
  year_group: string
  room_number: string | null
  academic_year: string
  teacher_id: string
}

export async function migrateClass(
  sourceClassId: string,
  newClass: MigrateClassInput,
): Promise<{
  data: { new_class_id: string } | null
  error: PostgrestError | null
}> {
  const { data, error } = await supabase.rpc('migrate_class', {
    p_source_class_id: sourceClassId,
    p_name: newClass.name,
    p_year_group: newClass.year_group,
    p_room_number: newClass.room_number as string,
    p_academic_year: newClass.academic_year,
    p_teacher_id: newClass.teacher_id,
  })
  return { data: data as { new_class_id: string } | null, error }
}

export async function setClassStudents(classId: string, studentIds: string[]) {
  const { error: deleteError } = await supabase
    .from('student_classes')
    .delete()
    .eq('class_id', classId)
  if (deleteError) throw deleteError

  if (studentIds.length > 0) {
    const { error: insertError } = await supabase
      .from('student_classes')
      .insert(
        studentIds.map((studentId) => ({
          class_id: classId,
          student_id: studentId,
        })),
      )
    if (insertError) throw insertError
  }
  revalidateTag('classes', 'max')
  revalidateTag('students', 'max')
}
