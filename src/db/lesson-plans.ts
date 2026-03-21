import { supabase } from './client'

export type LessonPlanRow = {
  id: string
  class_id: string
  lesson_date: string
  description: string
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
  class: { id: string; name: string; year_group: string }
  creator: { id: string; first_name: string; last_name: string }
  updater: { id: string; first_name: string; last_name: string } | null
}

const LESSON_PLAN_SELECT = `
  id, class_id, lesson_date, description,
  created_by, updated_by, created_at, updated_at,
  class:classes(id, name, year_group),
  creator:staff!lesson_plans_created_by_fkey(id, first_name, last_name),
  updater:staff!lesson_plans_updated_by_fkey(id, first_name, last_name)
`

export async function getLessonPlanCount(): Promise<number> {
  const { count, error } = await supabase
    .from('lesson_plans')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function getLessonPlans(options?: {
  classIds?: string[]
  limit?: number
  offset?: number
}): Promise<LessonPlanRow[]> {
  let query = supabase
    .from('lesson_plans')
    .select(LESSON_PLAN_SELECT)
    .order('lesson_date', { ascending: false })

  if (options?.classIds && options.classIds.length > 0) {
    query = query.in('class_id', options.classIds)
  }

  if (options?.limit !== undefined) {
    const from = options.offset ?? 0
    query = query.range(from, from + options.limit - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data as LessonPlanRow[]
}

export async function getLessonPlanById(
  id: string,
): Promise<LessonPlanRow | null> {
  const { data, error } = await supabase
    .from('lesson_plans')
    .select(LESSON_PLAN_SELECT)
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as LessonPlanRow
}

export async function createLessonPlan(data: {
  class_id: string
  lesson_date: string
  description: string
  created_by: string
}): Promise<LessonPlanRow> {
  const { data: row, error } = await supabase
    .from('lesson_plans')
    .insert(data)
    .select(LESSON_PLAN_SELECT)
    .single()
  if (error) throw error
  return row as LessonPlanRow
}

export async function updateLessonPlan(
  id: string,
  data: {
    lesson_date?: string
    description?: string
    updated_by: string
  },
): Promise<LessonPlanRow> {
  const { data: row, error } = await supabase
    .from('lesson_plans')
    .update(data)
    .eq('id', id)
    .select(LESSON_PLAN_SELECT)
    .single()
  if (error) throw error
  return row as LessonPlanRow
}
