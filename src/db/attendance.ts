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

/**
 * Returns attendance summary per class for a given date using a SQL aggregate
 * function (get_attendance_summary RPC). Must be registered in Supabase first —
 * see supabase/schema.sql.
 */
export async function getAttendanceSummaryByDate(
  date: string,
): Promise<Record<string, AttendanceClassSummary>> {
  const { data, error } = await supabase.rpc('get_attendance_summary', {
    p_date: date,
  })
  if (error) throw error
  if (!data) return {}
  const result: Record<string, AttendanceClassSummary> = {}
  for (const row of data as {
    class_id: string
    present_count: number
    min_created_at: string
    max_updated_at: string
  }[]) {
    result[row.class_id] = {
      presentCount: row.present_count,
      createdAt: row.min_created_at,
      updatedAt: row.max_updated_at,
    }
  }
  return result
}

/** @deprecated Use getAttendanceSummaryByDate (SQL RPC) for better performance at scale */
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

export async function getAttendanceLateCount(date: string): Promise<number> {
  const { count, error } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .eq('status', 'late')
  if (error) throw error
  return count ?? 0
}

/** Fetch attendance rows across a date range for aggregation (class_id, date, status). */
export async function getAttendanceByDateRange(
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from('attendance')
    .select('class_id, date, status')
    .gte('date', startDate)
    .lte('date', endDate)
  if (error) throw error
  return data ?? []
}

/** Count late students across a date range. */
export async function getAttendanceLateCountByDateRange(
  startDate: string,
  endDate: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('status', 'late')
  if (error) throw error
  return count ?? 0
}

export async function saveAttendance(records: AttendanceInsert[]) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,date' })
    .select()
  if (error) throw error
  return data
}
