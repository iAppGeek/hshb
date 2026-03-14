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

export type AttendanceClassSummary = {
  createdAt: string
  updatedAt: string
  presentCount: number
}

export async function getAttendanceLastUpdatedPerClass(
  date: string,
): Promise<Record<string, AttendanceClassSummary>> {
  const { data } = await supabase
    .from('attendance')
    .select('class_id, created_at, updated_at, status')
    .eq('date', date)
  if (!data) return {}
  const result: Record<string, AttendanceClassSummary> = {}
  for (const row of data) {
    if (!row.updated_at || !row.created_at) continue
    const existing = result[row.class_id]
    const isPresent = row.status === 'present' || row.status === 'late'
    if (!existing) {
      result[row.class_id] = {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        presentCount: isPresent ? 1 : 0,
      }
    } else {
      result[row.class_id] = {
        createdAt:
          row.created_at < existing.createdAt
            ? row.created_at
            : existing.createdAt,
        updatedAt:
          row.updated_at > existing.updatedAt
            ? row.updated_at
            : existing.updatedAt,
        presentCount: existing.presentCount + (isPresent ? 1 : 0),
      }
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
