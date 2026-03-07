import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import { getAllTimetableSlots, getTimetableByClass } from './timetable'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockSlot = {
  id: 'slot-1',
  class_id: 'class-1',
  day_of_week: 'Saturday',
  start_time: '10:00',
  end_time: '11:00',
  subject: 'Greek Language',
  room: 'R12',
  class: { id: 'class-1', name: 'Year 3A', year_group: '3' },
}

describe('getAllTimetableSlots', () => {
  it('returns all slots ordered by day and time', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockSlot] }),
        }),
      }),
    })

    const result = await getAllTimetableSlots()
    expect(result).toEqual([mockSlot])
    expect(mockFrom).toHaveBeenCalledWith('timetable_slots')
  })

  it('returns empty array when no slots exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getAllTimetableSlots()
    expect(result).toEqual([])
  })
})

describe('getTimetableByClass', () => {
  it('returns slots for the given class', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [mockSlot] }),
          }),
        }),
      }),
    })

    const result = await getTimetableByClass('class-1')
    expect(result).toEqual([mockSlot])
  })

  it('returns empty array when class has no slots', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })

    const result = await getTimetableByClass('class-99')
    expect(result).toEqual([])
  })
})
