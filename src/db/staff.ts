import { unstable_cache, revalidateTag } from 'next/cache'

import { TEACHING_ROLES } from '@/lib/permissions'

import { supabase } from './client'

const STAFF_SELECT =
  'id, email, first_name, last_name, display_name, role, contact_number, personal_email, created_at'

const OPTS = { revalidate: 60, tags: ['staff'] }

// Not cached — used during auth, must always be fresh
export async function getStaffByEmail(email: string) {
  const { data } = await supabase
    .from('staff')
    .select(STAFF_SELECT)
    .eq('email', email.toLowerCase())
    .single()
  return data
}

export const getStaffById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from('staff')
      .select(STAFF_SELECT)
      .eq('id', id)
      .single()
    return data
  },
  ['staff-by-id'],
  OPTS,
)

export const getAllStaff = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('staff')
      .select(STAFF_SELECT)
      .order('last_name')
    return data ?? []
  },
  ['all-staff'],
  OPTS,
)

export const getAllStaffWithClasses = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('staff')
      .select('*, classes(id, name, room_number, year_group)')
      .order('last_name')
    return data ?? []
  },
  ['all-staff-with-classes'],
  { revalidate: 60, tags: ['staff', 'classes'] },
)

export const getTeachers = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('staff')
      .select('id, first_name, last_name, display_name')
      .in('role', TEACHING_ROLES)
      .order('last_name')
    return data ?? []
  },
  ['teachers'],
  OPTS,
)

export async function createStaff(input: {
  first_name: string
  last_name: string
  email: string
  role: string
  display_name?: string | null
  contact_number?: string | null
  personal_email?: string | null
}) {
  const { data, error } = await supabase
    .from('staff')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  revalidateTag('staff', 'max')
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
    personal_email?: string | null
  },
) {
  const { error } = await supabase.from('staff').update(input).eq('id', id)
  if (error) throw error
  revalidateTag('staff', 'max')
  revalidateTag('classes', 'max') // staff name shown on class pages
}
