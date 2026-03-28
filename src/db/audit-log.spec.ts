import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockInsert } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
}))

vi.mock('@/db/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ insert: mockInsert }),
  },
}))

import { supabase } from '@/db/client'

import { logAuditEvent } from './audit-log'

beforeEach(() => {
  vi.clearAllMocks()
  mockInsert.mockResolvedValue({ error: null })
})

describe('logAuditEvent', () => {
  it('inserts into the audit_log table', async () => {
    logAuditEvent({
      staffId: 'staff-1',
      action: 'create',
      entity: 'staff',
      entityId: 'new-id',
      details: { first_name: 'Alice' },
    })

    await vi.waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('audit_log')
    })

    expect(mockInsert).toHaveBeenCalledWith({
      staff_id: 'staff-1',
      action: 'create',
      entity: 'staff',
      entity_id: 'new-id',
      details: { first_name: 'Alice' },
    })
  })

  it('maps staffId to staff_id and entityId to entity_id', async () => {
    logAuditEvent({
      staffId: 'staff-2',
      action: 'update',
      entity: 'student',
      entityId: 'student-1',
      details: { last_name: 'Smith' },
    })

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled()
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        staff_id: 'staff-2',
        entity_id: 'student-1',
      }),
    )
  })

  it('defaults entity_id and details to null when omitted', async () => {
    logAuditEvent({
      staffId: 'staff-1',
      action: 'delete',
      entity: 'class',
    })

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled()
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_id: null,
        details: null,
      }),
    )
  })

  it('does not throw when insert returns an error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockInsert.mockResolvedValue({ error: new Error('DB error') })

    logAuditEvent({
      staffId: 'staff-1',
      action: 'create',
      entity: 'staff',
    })

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[audit-log] failed to write:',
        expect.any(Error),
      )
    })

    consoleSpy.mockRestore()
  })

  it('does not throw when insert rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockInsert.mockRejectedValue(new Error('Network error'))

    logAuditEvent({
      staffId: 'staff-1',
      action: 'create',
      entity: 'staff',
    })

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[audit-log] unexpected error:',
        expect.any(Error),
      )
    })

    consoleSpy.mockRestore()
  })
})
