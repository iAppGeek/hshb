import { revalidateTag } from 'next/cache'

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

export async function getGuardianCount(): Promise<number> {
  const { count, error } = await supabase
    .from('guardians')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
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
  revalidateTag('students', 'max')
  return guardian
}

export type GuardianFull = GuardianInsert & { id: string }

export async function getGuardianById(
  id: string,
): Promise<GuardianFull | null> {
  const { data } = await supabase
    .from('guardians')
    .select(
      'id, first_name, last_name, phone, email, address_line_1, address_line_2, city, postcode, notes',
    )
    .eq('id', id)
    .single()
  return data
}

export type GuardianStudentLink = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
}

export async function getStudentsByGuardian(
  guardianId: string,
): Promise<GuardianStudentLink[]> {
  const { data } = await supabase
    .from('students')
    .select('id, first_name, last_name, student_code')
    .or(
      `primary_guardian_id.eq.${guardianId},secondary_guardian_id.eq.${guardianId},additional_contact_1_id.eq.${guardianId},additional_contact_2_id.eq.${guardianId}`,
    )
    .eq('active', true)
    .order('last_name')
  return data ?? []
}

export async function updateGuardian(id: string, data: GuardianInsert) {
  const { error } = await supabase
    .from('guardians')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidateTag('students', 'max')
}
