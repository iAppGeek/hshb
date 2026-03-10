import { supabase } from './client'

const CLASS_SELECT =
  '*, teacher:staff(id, first_name, last_name, display_name, email)'

export async function getAllClasses() {
  const { data } = await supabase
    .from('classes')
    .select(CLASS_SELECT)
    .eq('active', true)
    .order('year_group')
  return data ?? []
}

export async function getAllClassesIncludingInactive() {
  const { data } = await supabase
    .from('classes')
    .select(CLASS_SELECT)
    .order('year_group')
  return data ?? []
}

export async function getClassById(id: string) {
  const { data } = await supabase
    .from('classes')
    .select(`${CLASS_SELECT}, student_classes(student_id)`)
    .eq('id', id)
    .single()
  return data
}

export async function getClassesByTeacher(teacherId: string) {
  const { data } = await supabase
    .from('classes')
    .select(CLASS_SELECT)
    .eq('teacher_id', teacherId)
    .eq('active', true)
    .order('year_group')
  return data ?? []
}

export async function getClassWithStudents(id: string) {
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
}

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
  return cls
}

export async function updateClass(
  id: string,
  data: Partial<ClassInsert> & { active?: boolean },
) {
  const { error } = await supabase.from('classes').update(data).eq('id', id)
  if (error) throw error
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
}
