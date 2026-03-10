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

export async function getAttendanceLastUpdatedPerClass(
  date: string,
): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('attendance')
    .select('class_id, updated_at')
    .eq('date', date)
  if (!data) return {}
  const result: Record<string, string> = {}
  for (const row of data) {
    if (!row.updated_at) continue
    if (!result[row.class_id] || row.updated_at > result[row.class_id]) {
      result[row.class_id] = row.updated_at
    }
  }
  return result
}

export async function saveAttendance(records: AttendanceInsert[]) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,date' })
    .select()
  if (error) throw error
  return data
}
