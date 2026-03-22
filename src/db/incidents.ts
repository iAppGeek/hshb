import { supabase } from './client'

export type IncidentType = 'medical' | 'behaviour' | 'other'

export type IncidentRow = {
  id: string
  type: IncidentType
  student_id: string
  title: string
  description: string
  incident_date: string
  created_by: string
  updated_by: string | null
  parent_notified: boolean
  parent_notified_at: string | null
  created_at: string
  updated_at: string
  student: { id: string; first_name: string; last_name: string }
  creator: { id: string; first_name: string; last_name: string }
  updater: { id: string; first_name: string; last_name: string } | null
}

const INCIDENT_SELECT = `
  id, type, student_id, title, description, incident_date,
  created_by, updated_by, parent_notified, parent_notified_at,
  created_at, updated_at,
  student:students(id, first_name, last_name),
  creator:staff!incidents_created_by_fkey(id, first_name, last_name),
  updater:staff!incidents_updated_by_fkey(id, first_name, last_name)
`

export async function getIncidentCount(): Promise<number> {
  const { count, error } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function getIncidents(options?: {
  studentIds?: string[]
  limit?: number
  offset?: number
}): Promise<IncidentRow[]> {
  let query = supabase
    .from('incidents')
    .select(INCIDENT_SELECT)
    .order('incident_date', { ascending: false })

  if (options?.studentIds && options.studentIds.length > 0) {
    query = query.in('student_id', options.studentIds)
  }

  if (options?.limit !== undefined) {
    const from = options.offset ?? 0
    query = query.range(from, from + options.limit - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data as IncidentRow[]
}

export async function getIncidentById(id: string): Promise<IncidentRow | null> {
  const { data, error } = await supabase
    .from('incidents')
    .select(INCIDENT_SELECT)
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as IncidentRow
}

export async function createIncident(data: {
  type: IncidentType
  student_id: string
  title: string
  description: string
  incident_date: string
  created_by: string
  parent_notified?: boolean
  parent_notified_at?: string | null
}): Promise<IncidentRow> {
  const { data: row, error } = await supabase
    .from('incidents')
    .insert(data)
    .select(INCIDENT_SELECT)
    .single()
  if (error) throw error
  return row as IncidentRow
}

export type IncidentCounts = {
  medical: number
  behaviour: number
  other: number
  total: number
}

/** Count incidents by type across a date range (inclusive). */
export async function getIncidentCountsByDateRange(
  startDate: string,
  endDate: string,
): Promise<IncidentCounts> {
  const { data, error } = await supabase
    .from('incidents')
    .select('type')
    .gte('incident_date', startDate)
    .lte('incident_date', endDate)
  if (error) throw error
  const counts: IncidentCounts = {
    medical: 0,
    behaviour: 0,
    other: 0,
    total: 0,
  }
  for (const row of data ?? []) {
    const t = row.type as IncidentType
    counts[t]++
    counts.total++
  }
  return counts
}

export async function updateIncident(
  id: string,
  data: {
    title?: string
    description?: string
    incident_date?: string
    updated_by: string
    parent_notified?: boolean
    parent_notified_at?: string | null
  },
): Promise<IncidentRow> {
  const { data: row, error } = await supabase
    .from('incidents')
    .update(data)
    .eq('id', id)
    .select(INCIDENT_SELECT)
    .single()
  if (error) throw error
  return row as IncidentRow
}
