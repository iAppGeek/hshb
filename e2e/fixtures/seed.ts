import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const db = createClient(supabaseUrl, supabaseKey)

// Known seed UUIDs for reliable assertions
export const SEED_IDS = {
  staff: {
    admin: '00000000-0000-0000-0000-000000000001',
    teacher: '00000000-0000-0000-0000-000000000002',
    teacher2: '00000000-0000-0000-0000-000000000003',
    headteacher: '00000000-0000-0000-0000-000000000004',
    secretary: '00000000-0000-0000-0000-000000000005',
  },
  classes: {
    alpha: '10000000-0000-0000-0000-000000000001',
    beta: '10000000-0000-0000-0000-000000000002',
    gamma: '10000000-0000-0000-0000-000000000003',
  },
  students: {
    alice: '30000000-0000-0000-0000-000000000001',
    bob: '30000000-0000-0000-0000-000000000002',
    carol: '30000000-0000-0000-0000-000000000003',
  },
  incidents: {
    medical: '60000000-0000-0000-0000-000000000001',
    behaviour: '60000000-0000-0000-0000-000000000002',
  },
  lessonPlan: {
    alpha: '70000000-0000-0000-0000-000000000001',
  },
} as const

export async function deleteStudentsByEmail(emails: string[]): Promise<void> {
  await db.from('students').delete().in('email', emails)
}

export async function deleteStaffByEmail(email: string): Promise<void> {
  await db.from('staff').delete().eq('email', email)
}

export async function deleteClassByName(name: string): Promise<void> {
  await db.from('classes').delete().eq('name', name)
}

export async function deleteIncidentsByTitle(title: string): Promise<void> {
  await db.from('incidents').delete().eq('title', title)
}

export async function deleteLessonPlansByClassAndDate(
  classId: string,
  date: string,
): Promise<void> {
  await db
    .from('lesson_plans')
    .delete()
    .eq('class_id', classId)
    .eq('lesson_date', date)
}
