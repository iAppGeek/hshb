import { supabase } from './client'

export async function getAllStudents() {
  const { data } = await supabase
    .from('students')
    .select('*, class:classes(id, name, year_group)')
    .eq('active', true)
    .order('last_name')
  return data ?? []
}

export async function getStudentsByClass(classId: string) {
  const { data } = await supabase
    .from('students')
    .select('*, class:classes(id, name, year_group)')
    .eq('class_id', classId)
    .eq('active', true)
    .order('last_name')
  return data ?? []
}

export async function getStudentById(id: string) {
  const { data } = await supabase
    .from('students')
    .select('*, class:classes(id, name, year_group, teacher_id)')
    .eq('id', id)
    .single()
  return data
}
