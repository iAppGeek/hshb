import type { TablesInsert } from '../types/database'

import { supabase } from './client'

export type PushSubscriptionRow = {
  id: string
  staff_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string | null
}

export type SavePushSubscriptionInput = TablesInsert<'push_subscriptions'>

export async function savePushSubscription(
  input: SavePushSubscriptionInput,
): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(input, { onConflict: 'endpoint' })
  if (error) throw error
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
  if (error) throw error
}

export async function pushSubscriptionExists(
  endpoint: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', endpoint)
    .maybeSingle()
  if (error) throw error
  return data !== null
}

export async function getAdminSubscriptions(): Promise<PushSubscriptionRow[]> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select(
      'id, staff_id, endpoint, p256dh, auth, created_at, staff!inner(role)',
    )
    .in('staff.role', ['admin', 'headteacher'])
  if (error) throw error
  return (data ?? []) as unknown as PushSubscriptionRow[]
}
