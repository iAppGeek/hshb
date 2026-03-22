import { supabase } from './client'

export type StaffAttendanceRow = {
  id: string
  staff_id: string
  date: string
  signed_in_at: string
  signed_out_at: string | null
  created_at: string | null
  updated_at: string | null
}

/** Fetch a single staff member's attendance record for a given date. Returns null if not found. */
export async function getStaffAttendanceForToday(
  staffId: string,
  date: string,
): Promise<StaffAttendanceRow | null> {
  const { data, error } = await supabase
    .from('staff_attendance')
    .select('*')
    .eq('staff_id', staffId)
    .eq('date', date)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Fetch all staff attendance records for a given date. */
export async function getStaffAttendanceByDate(
  date: string,
): Promise<StaffAttendanceRow[]> {
  const { data, error } = await supabase
    .from('staff_attendance')
    .select('*')
    .eq('date', date)
  if (error) throw error
  return data ?? []
}

/**
 * Upsert a sign-in record. On conflict (staff_id, date) updates signed_in_at
 * and clears signed_out_at (supports re-sign-in after sign-out).
 */
export async function signInStaff(
  staffId: string,
  date: string,
  signedInAt: string,
): Promise<void> {
  const { error } = await supabase.from('staff_attendance').upsert(
    {
      staff_id: staffId,
      date,
      signed_in_at: signedInAt,
      signed_out_at: null,
    },
    { onConflict: 'staff_id,date' },
  )
  if (error) throw error
}

/** Update the signed_out_at timestamp for an existing record. */
export async function signOutStaff(
  staffId: string,
  date: string,
  signedOutAt: string,
): Promise<void> {
  const { error } = await supabase
    .from('staff_attendance')
    .update({ signed_out_at: signedOutAt })
    .eq('staff_id', staffId)
    .eq('date', date)
  if (error) throw error
}

/** Fetch all staff attendance records within a date range (inclusive). */
export async function getStaffAttendanceByDateRange(
  startDate: string,
  endDate: string,
): Promise<StaffAttendanceRow[]> {
  const { data, error } = await supabase
    .from('staff_attendance')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Count of staff currently signed in (signed_in_at set, signed_out_at null) for a date. */
export async function getStaffSignedInCount(date: string): Promise<number> {
  const { count, error } = await supabase
    .from('staff_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .is('signed_out_at', null)
  if (error) throw error
  return count ?? 0
}
