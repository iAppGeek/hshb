import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClass, setClassStudents } from '@/db'

import { createClassAction } from './actions'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/db', () => ({
  createClass: vi.fn(),
  setClassStudents: vi.fn(),
}))

const STAFF_ID = '00000000-0000-4000-8000-000000000001'
const CLASS_ID = '00000000-0000-4000-8000-000000000010'
const STUDENT_1 = '00000000-0000-4000-8000-000000000020'
const STUDENT_2 = '00000000-0000-4000-8000-000000000030'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(key, v))
    } else {
      fd.set(key, value)
    }
  }
  return fd
}

const baseFields = {
  name: 'Year 1A',
  year_group: '1',
  room_number: 'R1',
  academic_year: '2024/25',
  teacher_id: STAFF_ID,
}

describe('createClassAction', () => {
  it('creates class, sets students, revalidates, and redirects', async () => {
    vi.mocked(createClass).mockResolvedValue({ id: CLASS_ID } as any)
    vi.mocked(setClassStudents).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(createClassAction(makeFormData(baseFields))).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(createClass).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Year 1A',
        year_group: '1',
        room_number: 'R1',
        academic_year: '2024/25',
        teacher_id: STAFF_ID,
      }),
    )
    expect(setClassStudents).toHaveBeenCalledWith(CLASS_ID, [])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/classes')
    expect(redirect).toHaveBeenCalledWith('/portal/classes')
  })

  it('passes selected student ids to setClassStudents', async () => {
    vi.mocked(createClass).mockResolvedValue({ id: CLASS_ID } as any)
    vi.mocked(setClassStudents).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const fields = {
      ...baseFields,
      student_ids: [STUDENT_1, STUDENT_2],
    }

    await expect(createClassAction(makeFormData(fields))).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(setClassStudents).toHaveBeenCalledWith(CLASS_ID, [
      STUDENT_1,
      STUDENT_2,
    ])
  })

  it('converts empty optional fields to null', async () => {
    vi.mocked(createClass).mockResolvedValue({ id: CLASS_ID } as any)
    vi.mocked(setClassStudents).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const fields = {
      name: 'Year 2B',
      year_group: '2',
      room_number: '',
      academic_year: '',
      teacher_id: STAFF_ID,
    }

    await expect(createClassAction(makeFormData(fields))).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(createClass).toHaveBeenCalledWith(
      expect.objectContaining({
        room_number: null,
        academic_year: undefined,
      }),
    )
  })

  it('returns error when createClass throws', async () => {
    vi.mocked(createClass).mockRejectedValue(new Error('DB error'))

    const result = await createClassAction(makeFormData(baseFields))
    expect(result).toEqual({
      error: 'Failed to create class. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})
