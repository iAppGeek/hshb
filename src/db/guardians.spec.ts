import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import { getAllGuardians, createGuardian } from './guardians'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getAllGuardians', () => {
  it('returns guardians ordered by last name', async () => {
    const mockGuardians = [
      {
        id: 'g-1',
        first_name: 'Maria',
        last_name: 'Smith',
        phone: '07700 900000',
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockGuardians }),
      }),
    })

    const result = await getAllGuardians()
    expect(result).toEqual(mockGuardians)
    expect(mockFrom).toHaveBeenCalledWith('guardians')
  })

  it('returns empty array when no guardians exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null }),
      }),
    })

    const result = await getAllGuardians()
    expect(result).toEqual([])
  })
})

describe('createGuardian', () => {
  it('inserts a guardian and returns the id', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'guardian-1' },
            error: null,
          }),
        }),
      }),
    })

    const result = await createGuardian({
      first_name: 'Maria',
      last_name: 'Papadopoulos',
      phone: '07700 900000',
      email: 'maria@example.com',
    })

    expect(result).toEqual({ id: 'guardian-1' })
    expect(mockFrom).toHaveBeenCalledWith('guardians')
  })

  it('throws when the database returns an error', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('DB error'),
          }),
        }),
      }),
    })

    await expect(
      createGuardian({ first_name: 'A', last_name: 'B', phone: '07700' }),
    ).rejects.toThrow('DB error')
  })
})
