import { supabase } from './client'

const STAFF_SELECT =
  'id, email, first_name, last_name, display_name, role, contact_number, created_at'

export async function getStaffByEmail(email: string) {
  const { data } = await supabase
    .from('staff')
    .select(STAFF_SELECT)
    .eq('email', email.toLowerCase())
    .single()
  return data
}

export async function getStaffById(id: string) {
  const { data } = await supabase
    .from('staff')
    .select(STAFF_SELECT)
    .eq('id', id)
    .single()
  return data
}

export async function getAllStaff() {
  const { data } = await supabase
    .from('staff')
    .select(STAFF_SELECT)
    .order('last_name')
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

export async function getTeachers() {
  const { data } = await supabase
    .from('staff')
    .select('id, first_name, last_name, display_name')
    .in('role', ['teacher', 'headteacher'])
    .order('last_name')
  return data ?? []
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
