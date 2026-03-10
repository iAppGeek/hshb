import { supabase } from './client'

export async function getAllClasses() {
  const { data } = await supabase
    .from('classes')
    .select('*, teacher:staff(id, first_name, last_name, display_name, email)')
    .eq('active', true)
    .order('year_group')
  return data ?? []
}

export async function getClassesByTeacher(teacherId: string) {
  const { data } = await supabase
    .from('classes')
    .select('*, teacher:staff(id, first_name, last_name, display_name, email)')
    .eq('teacher_id', teacherId)
    .eq('active', true)
    .order('year_group')
  return data ?? []
}
