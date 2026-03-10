import { supabase } from './client'

export async function getStaffByEmail(email: string) {
  const { data } = await supabase
    .from('staff')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  return data
}

export async function getStaffById(id: string) {
  const { data } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getAllStaff() {
  const { data } = await supabase.from('staff').select('*').order('last_name')
  return data ?? []
}

export async function getAllStaffWithClasses() {
  const { data } = await supabase
    .from('staff')
    .select('*, classes(id, name, room_number, year_group)')
    .order('last_name')
  return data ?? []
}

export async function createStaff(input: {
  first_name: string
  last_name: string
  email: string
  role: string
  display_name?: string | null
  contact_number?: string | null
}) {
  const { data, error } = await supabase
    .from('staff')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStaff(
  id: string,
  input: {
    first_name: string
    last_name: string
    email: string
    role: string
    display_name?: string | null
    contact_number?: string | null
  },
) {
  const { error } = await supabase.from('staff').update(input).eq('id', id)
  if (error) throw error
}
