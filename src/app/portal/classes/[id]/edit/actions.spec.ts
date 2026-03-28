import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { updateClass, setClassStudents } from '@/db'

import { updateClassAction } from './actions'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/db', () => ({
  updateClass: vi.fn(),
  setClassStudents: vi.fn(),
}))

const CLASS_ID = '00000000-0000-4000-8000-000000000001'
const STAFF_ID = '00000000-0000-4000-8000-000000000010'
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
  active: 'true',
}

describe('updateClassAction', () => {
  it('updates class, sets students, revalidates, and redirects', async () => {
    vi.mocked(updateClass).mockResolvedValue(undefined)
    vi.mocked(setClassStudents).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      updateClassAction(CLASS_ID, makeFormData(baseFields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateClass).toHaveBeenCalledWith(
      CLASS_ID,
      expect.objectContaining({
        name: 'Year 1A',
        year_group: '1',
        teacher_id: STAFF_ID,
        active: true,
      }),
    )
    expect(setClassStudents).toHaveBeenCalledWith(CLASS_ID, [])
    expect(revalidatePath).toHaveBeenCalledWith('/portal/classes')
    expect(redirect).toHaveBeenCalledWith('/portal/classes')
  })

  it('sets active to false when active field is not "true"', async () => {
    vi.mocked(updateClass).mockResolvedValue(undefined)
    vi.mocked(setClassStudents).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const fields = { ...baseFields, active: 'false' }

    await expect(
      updateClassAction(CLASS_ID, makeFormData(fields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateClass).toHaveBeenCalledWith(
      CLASS_ID,
      expect.objectContaining({ active: false }),
    )
  })

  it('passes selected student ids to setClassStudents', async () => {
    vi.mocked(updateClass).mockResolvedValue(undefined)
    vi.mocked(setClassStudents).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const fields = {
      ...baseFields,
      student_ids: [STUDENT_1, STUDENT_2],
    }

    await expect(
      updateClassAction(CLASS_ID, makeFormData(fields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(setClassStudents).toHaveBeenCalledWith(CLASS_ID, [
      STUDENT_1,
      STUDENT_2,
    ])
  })

  it('returns error when updateClass throws', async () => {
    vi.mocked(updateClass).mockRejectedValue(new Error('DB error'))

    const result = await updateClassAction(CLASS_ID, makeFormData(baseFields))
    expect(result).toEqual({
      error: 'Failed to update class. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})
