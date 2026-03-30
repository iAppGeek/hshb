import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { migrateClass, logAuditEvent } from '@/db'

import { migrateClassAction } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/db', () => ({
  migrateClass: vi.fn(),
  logAuditEvent: vi.fn(),
}))

const STAFF_ID = '00000000-0000-4000-8000-000000000001'
const SOURCE_CLASS_ID = '00000000-0000-4000-8000-000000000010'
const NEW_CLASS_ID = '00000000-0000-4000-8000-000000000011'
const TEACHER_ID = '00000000-0000-4000-8000-000000000020'

const adminSession = { user: { staffId: STAFF_ID, role: 'admin' } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(adminSession as any)
})

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const baseFields = {
  source_class_id: SOURCE_CLASS_ID,
  name: 'Year 2A',
  year_group: '2',
  room_number: 'R2',
  academic_year: '2026/27',
  teacher_id: TEACHER_ID,
}

describe('migrateClassAction', () => {
  it('returns error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await migrateClassAction(makeFormData(baseFields))
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(migrateClass).not.toHaveBeenCalled()
  })

  it('returns error when role is teacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: STAFF_ID, role: 'teacher' },
    } as any)

    const result = await migrateClassAction(makeFormData(baseFields))
    expect(result).toEqual({ error: 'Not authorised' })
    expect(migrateClass).not.toHaveBeenCalled()
  })

  it('returns validation error for invalid source_class_id', async () => {
    const result = await migrateClassAction(
      makeFormData({ ...baseFields, source_class_id: 'not-a-uuid' }),
    )
    expect(result).toEqual({ error: expect.any(String) })
    expect(migrateClass).not.toHaveBeenCalled()
  })

  it('returns error when RPC returns an error', async () => {
    vi.mocked(migrateClass).mockResolvedValue({
      data: null,
      error: { message: 'Source class is already inactive' } as any,
    })

    const result = await migrateClassAction(makeFormData(baseFields))
    expect(result).toEqual({ error: 'Source class is already inactive' })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('calls migrateClass with correct args, logs audit, revalidates, and redirects on success', async () => {
    vi.mocked(migrateClass).mockResolvedValue({
      data: { new_class_id: NEW_CLASS_ID },
      error: null,
    })
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(migrateClassAction(makeFormData(baseFields))).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(migrateClass).toHaveBeenCalledWith(SOURCE_CLASS_ID, {
      name: 'Year 2A',
      year_group: '2',
      room_number: 'R2',
      academic_year: '2026/27',
      teacher_id: TEACHER_ID,
    })
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: STAFF_ID,
        action: 'create',
        entity: 'class',
        entityId: NEW_CLASS_ID,
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/class-migration')
    expect(redirect).toHaveBeenCalledWith('/portal/class-migration')
  })

  it('converts empty room_number to null', async () => {
    vi.mocked(migrateClass).mockResolvedValue({
      data: { new_class_id: NEW_CLASS_ID },
      error: null,
    })
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      migrateClassAction(makeFormData({ ...baseFields, room_number: '' })),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(migrateClass).toHaveBeenCalledWith(
      SOURCE_CLASS_ID,
      expect.objectContaining({ room_number: null }),
    )
  })
})
