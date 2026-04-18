import { describe, it, expect, afterEach, vi } from 'vitest'

import {
  datetimeLocalToUtcIso,
  formatCalendarDate,
  formatDateInSchoolTz,
  formatDateTimeInSchoolTz,
  formatTimeInSchoolTz,
  nowDatetimeLocalInSchoolTz,
  nowTimeInSchoolTz,
  schoolTzToUtcIso,
  toDatetimeLocalInSchoolTz,
  todayInSchoolTz,
} from './datetime'

afterEach(() => {
  vi.useRealTimers()
})

describe('schoolTzToUtcIso', () => {
  it('treats summer (BST) wall-clock as UTC+1', () => {
    // 15 July 2026 is BST (UTC+1)
    expect(schoolTzToUtcIso('2026-07-15', '09:00')).toBe(
      '2026-07-15T08:00:00.000Z',
    )
  })

  it('treats winter (GMT) wall-clock as UTC+0', () => {
    // 15 January 2026 is GMT
    expect(schoolTzToUtcIso('2026-01-15', '09:00')).toBe(
      '2026-01-15T09:00:00.000Z',
    )
  })

  it('handles the spring-forward boundary', () => {
    // 29 March 2026 is the day BST starts at 01:00 UTC (clocks jump 01:00 → 02:00).
    // 10:00 local that day is BST, so UTC is 09:00.
    expect(schoolTzToUtcIso('2026-03-29', '10:00')).toBe(
      '2026-03-29T09:00:00.000Z',
    )
  })

  it('handles the fall-back boundary', () => {
    // 25 October 2026 clocks roll back 02:00 → 01:00 local.
    // 10:00 local is after the transition, so GMT: UTC == local.
    expect(schoolTzToUtcIso('2026-10-25', '10:00')).toBe(
      '2026-10-25T10:00:00.000Z',
    )
  })
})

describe('datetimeLocalToUtcIso', () => {
  it('accepts a datetime-local string (BST)', () => {
    expect(datetimeLocalToUtcIso('2026-07-15T14:30')).toBe(
      '2026-07-15T13:30:00.000Z',
    )
  })

  it('accepts a datetime-local string with seconds (GMT)', () => {
    expect(datetimeLocalToUtcIso('2026-01-15T14:30:45')).toBe(
      '2026-01-15T14:30:45.000Z',
    )
  })

  it('rejects malformed input', () => {
    expect(() => datetimeLocalToUtcIso('not-a-date')).toThrow()
  })
})

describe('formatTimeInSchoolTz', () => {
  it('renders a summer entry the same way year-round', () => {
    // Entry made at 09:00 on 15 July 2026 (BST) → stored as 08:00Z.
    const stored = '2026-07-15T08:00:00.000Z'

    // Viewed immediately (still summer) — should display 09:00.
    expect(formatTimeInSchoolTz(stored)).toBe('09:00')

    // Viewed later in winter — must still display 09:00, not 08:00.
    // (We pin "now" to a January date to simulate a winter viewer; the
    // helper ignores "now" because it formats a specific instant in
    // Europe/London, so this is really a sanity check that the output
    // does not depend on the current date.)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-10T12:00:00Z'))
    expect(formatTimeInSchoolTz(stored)).toBe('09:00')
  })

  it('renders a winter entry correctly', () => {
    // 09:00 GMT on 15 Jan 2026 → stored as 09:00Z.
    expect(formatTimeInSchoolTz('2026-01-15T09:00:00.000Z')).toBe('09:00')
  })

  it('round-trips wall-clock → UTC → wall-clock across DST', () => {
    const summerUtc = schoolTzToUtcIso('2026-07-15', '09:30')
    const winterUtc = schoolTzToUtcIso('2026-01-15', '09:30')
    expect(formatTimeInSchoolTz(summerUtc)).toBe('09:30')
    expect(formatTimeInSchoolTz(winterUtc)).toBe('09:30')
  })
})

describe('formatDateInSchoolTz', () => {
  it('does not roll a BST entry back a day when rendered in winter', () => {
    // 23:30 local on 15 July 2026 (BST) → 22:30Z on 15 July.
    const stored = schoolTzToUtcIso('2026-07-15', '23:30')
    expect(stored).toBe('2026-07-15T22:30:00.000Z')
    expect(formatDateInSchoolTz(stored)).toBe('15/07/2026')
  })
})

describe('formatDateTimeInSchoolTz', () => {
  it('shows a summer entry with its original wall clock when viewed later', () => {
    const stored = schoolTzToUtcIso('2026-07-15', '14:15')
    expect(formatDateTimeInSchoolTz(stored)).toBe('15/07/2026, 14:15')
  })
})

describe('toDatetimeLocalInSchoolTz', () => {
  it('round-trips through datetime-local editing in summer', () => {
    const stored = schoolTzToUtcIso('2026-07-15', '09:45')
    expect(toDatetimeLocalInSchoolTz(stored)).toBe('2026-07-15T09:45')
  })

  it('round-trips through datetime-local editing in winter', () => {
    const stored = schoolTzToUtcIso('2026-01-15', '09:45')
    expect(toDatetimeLocalInSchoolTz(stored)).toBe('2026-01-15T09:45')
  })
})

describe('formatCalendarDate', () => {
  it('formats a YYYY-MM-DD string without shifting day', () => {
    expect(formatCalendarDate('2026-07-15')).toBe('15/07/2026')
  })

  it('passes through intl options', () => {
    expect(
      formatCalendarDate('2026-07-15', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    ).toBe('Wednesday, 15 July 2026')
  })
})

describe('todayInSchoolTz', () => {
  it('returns the London date when UTC has rolled into the next day', () => {
    // 15 July 2026 23:30 BST == 16 July 2026 is wrong — UTC is still 22:30
    // on the 15th. But at 00:30Z on 16 July, London is 01:30 BST on 16 July.
    // Pick an instant that disagrees between UTC and London:
    // 15 July 2026 23:30 UTC == 16 July 2026 00:30 BST.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T23:30:00Z'))
    expect(todayInSchoolTz()).toBe('2026-07-16')
  })

  it('returns the same day when UTC and London agree (winter)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T09:00:00Z'))
    expect(todayInSchoolTz()).toBe('2026-01-15')
  })
})

describe('nowTimeInSchoolTz', () => {
  it('returns BST wall-clock time in summer', () => {
    vi.useFakeTimers()
    // 08:30Z on 15 July 2026 == 09:30 BST.
    vi.setSystemTime(new Date('2026-07-15T08:30:00Z'))
    expect(nowTimeInSchoolTz()).toBe('09:30')
  })

  it('returns GMT wall-clock time in winter', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T08:30:00Z'))
    expect(nowTimeInSchoolTz()).toBe('08:30')
  })
})

describe('nowDatetimeLocalInSchoolTz', () => {
  it('returns a datetime-local string in BST during summer', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T08:30:00Z'))
    expect(nowDatetimeLocalInSchoolTz()).toBe('2026-07-15T09:30')
  })
})
