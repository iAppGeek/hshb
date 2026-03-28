'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { signInStaff, signOutStaff } from '@/db'
import { canManageStaffAttendance } from '@/lib/permissions'
import {
  staffAttendanceSchema,
  extractFormFields,
  type ActionResult,
} from '@/lib/schemas'
import type { StaffRole } from '@/types/next-auth'

function buildTimestamp(date: string, time: string): string {
  return `${date}T${time}:00`
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.staffId) return { error: 'Not authenticated' }

  const raw = extractFormFields(formData)
  const parsed = staffAttendanceSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { staffId, date, time } = parsed.data

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

export async function signOutAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.staffId) return { error: 'Not authenticated' }

  const raw = extractFormFields(formData)
  const parsed = staffAttendanceSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { staffId, date, time } = parsed.data

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
