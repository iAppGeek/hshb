import { supabase } from './client'

type GuardianInsert = {
  first_name: string
  last_name: string
  phone: string
  email?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  postcode?: string | null
  notes?: string | null
}

export type GuardianSummary = {
  id: string
  first_name: string
  last_name: string
  phone: string
}

export async function getAllGuardians(): Promise<GuardianSummary[]> {
  const { data } = await supabase
    .from('guardians')
    .select('id, first_name, last_name, phone')
    .order('last_name')
  return data ?? []
}

export async function createGuardian(data: GuardianInsert) {
  const { data: guardian, error } = await supabase
    .from('guardians')
    .insert(data)
    .select('id')
    .single()
  if (error) throw error
  return guardian
}
