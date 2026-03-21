'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { signInStaff, signOutStaff } from '@/db'
import { canManageStaffAttendance } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

function buildTimestamp(date: string, time: string): string {
  // Combine date (YYYY-MM-DD) and time (HH:MM) into a full ISO timestamp.
  // We use the local date + time as provided — the browser sends local time.
  return `${date}T${time}:00`
}

export async function signInAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session?.user?.staffId) return { error: 'Not authenticated' }

  const staffId = formData.get('staffId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string

  if (!staffId || !date || !time) return { error: 'Missing required fields' }

  const role = session.user.role as StaffRole
  if (!canManageStaffAttendance(role) && staffId !== session.user.staffId) {
    return { error: 'Not authorised' }
  }

  try {
    await signInStaff(staffId, date, buildTimestamp(date, time))
    revalidatePath('/portal/staff-attendance')
  } catch {
    return { error: 'Failed to sign in. Please try again.' }
  }
}

export async function signOutAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session?.user?.staffId) return { error: 'Not authenticated' }

  const staffId = formData.get('staffId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string

  if (!staffId || !date || !time) return { error: 'Missing required fields' }

  const role = session.user.role as StaffRole
  if (!canManageStaffAttendance(role) && staffId !== session.user.staffId) {
    return { error: 'Not authorised' }
  }

  try {
    await signOutStaff(staffId, date, buildTimestamp(date, time))
    revalidatePath('/portal/staff-attendance')
  } catch {
    return { error: 'Failed to sign out. Please try again.' }
  }
}
