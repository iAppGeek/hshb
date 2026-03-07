import { supabase } from './client'

export async function getAllTimetableSlots() {
  const { data } = await supabase
    .from('timetable_slots')
    .select('*, class:classes(id, name, year_group)')
    .order('day_of_week')
    .order('start_time')
  return data ?? []
}

export async function getTimetableByClass(classId: string) {
  const { data } = await supabase
    .from('timetable_slots')
    .select('*')
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time')
  return data ?? []
}
