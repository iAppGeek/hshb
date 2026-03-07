import { supabase } from './client'

export async function getAllClasses() {
  const { data } = await supabase
    .from('classes')
    .select('*, teacher:staff(id, name, email)')
    .order('year_group')
  return data ?? []
}

export async function getClassesByTeacher(teacherId: string) {
  const { data } = await supabase
    .from('classes')
    .select('*, teacher:staff(id, name, email)')
    .eq('teacher_id', teacherId)
    .order('year_group')
  return data ?? []
}
