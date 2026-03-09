import type { TablesInsert } from '@/types/database'

import { supabase } from './client'

export type AttendanceStatus = 'present' | 'absent' | 'late'
export type AttendanceInsert = TablesInsert<'attendance'>

export async function getAttendanceByClassAndDate(
  classId: string,
  date: string,
) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .eq('date', date)
  if (error) throw error
  return data
}

export async function saveAttendance(records: AttendanceInsert[]) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,date' })
    .select()
  if (error) throw error
  return data
}
