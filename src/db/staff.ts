import { supabase } from './client'

export async function getStaffByEmail(email: string) {
  const { data } = await supabase
    .from('staff')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  return data
}

export async function getAllStaff() {
  const { data } = await supabase
    .from('staff')
    .select('*')
    .order('name')
  return data ?? []
}
