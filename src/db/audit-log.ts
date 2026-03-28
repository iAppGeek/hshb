import type { Json } from '@/types/database'

import { supabase } from './client'

type AuditAction = 'create' | 'update' | 'delete' | 'sign_in' | 'sign_out'

type AuditEntry = {
  staffId: string | null
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}

export function logAuditEvent(entry: AuditEntry): void {
  Promise.resolve(
    supabase.from('audit_log').insert({
      staff_id: entry.staffId,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      details: (entry.details as Json) ?? null,
    }),
  )
    .then(({ error }) => {
      if (error) console.error('[audit-log] failed to write:', error)
    })
    .catch((err: unknown) => {
      console.error('[audit-log] unexpected error:', err)
    })
}
