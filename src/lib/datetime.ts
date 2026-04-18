/**
 * Date/time helpers for the portal.
 *
 * All staff, attendance, incidents, and lesson plan flows interpret user input
 * as wall-clock time in the school's timezone (Europe/London). Values are
 * stored in Postgres `timestamptz` as UTC instants and rendered back in
 * Europe/London — so an entry made at 09:00 BST in July always renders 09:00
 * regardless of when (or in which season) it is viewed later.
 *
 * Use these helpers instead of calling `new Date()`, `toISOString()`,
 * `toLocaleDateString()`, `toLocaleTimeString()` etc. directly — those rely
 * on the runtime's timezone and will silently drift by an hour across DST.
 */

/** IANA zone for the school. Everything the portal shows or stores is anchored here. */
export const SCHOOL_TIMEZONE = 'Europe/London'

type WallClockParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function partsInSchoolTz(instant: Date): WallClockParts {
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const map: Record<string, string> = {}
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    // `en-GB` emits "24" instead of "00" at midnight.
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Convert a wall-clock date + time in Europe/London to a UTC ISO string.
 *
 * Use at the server-action boundary when writing user-entered date/time pairs
 * (e.g. staff sign-in/out) into a `timestamptz` column. DST is handled from
 * the entry date, so `09:00` on a summer day becomes `08:00Z` and `09:00` on
 * a winter day becomes `09:00Z`.
 *
 * @param date - `YYYY-MM-DD` calendar date in Europe/London.
 * @param time - `HH:MM` wall-clock time in Europe/London.
 * @returns UTC ISO string suitable for Postgres `timestamptz`.
 */
export function schoolTzToUtcIso(date: string, time: string): string {
  return datetimeLocalToUtcIso(`${date}T${time}`)
}

/**
 * Convert a `<input type="datetime-local">` value (interpreted as
 * Europe/London wall-clock) to a UTC ISO string.
 *
 * Use at the server-action boundary for fields backed by `datetime-local`
 * inputs (incidents, parent-notified timestamps). Handles DST the same way
 * as {@link schoolTzToUtcIso}.
 *
 * @param localDateTime - `YYYY-MM-DDTHH:MM` (seconds optional) in London wall-clock.
 * @returns UTC ISO string suitable for Postgres `timestamptz`.
 */
export function datetimeLocalToUtcIso(localDateTime: string): string {
  const match = localDateTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  )
  if (!match) throw new Error(`Invalid datetime-local value: ${localDateTime}`)
  const [, y, mo, d, h, mi, s] = match
  const target: WallClockParts = {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    hour: Number(h),
    minute: Number(mi),
    second: Number(s ?? '0'),
  }

  // Start by assuming the wall-clock numbers are UTC, then correct using the
  // school-tz offset that applies at that instant. One re-check covers DST
  // transitions (when the first guess lands on the wrong side of the jump).
  let guess = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute,
    target.second,
  )
  for (let i = 0; i < 2; i++) {
    const observed = partsInSchoolTz(new Date(guess))
    const observedUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    )
    const targetUtc = Date.UTC(
      target.year,
      target.month - 1,
      target.day,
      target.hour,
      target.minute,
      target.second,
    )
    const diff = targetUtc - observedUtc
    if (diff === 0) break
    guess += diff
  }
  return new Date(guess).toISOString()
}

/**
 * Today's calendar date in Europe/London as `YYYY-MM-DD`.
 *
 * Use instead of `new Date().toISOString().split('T')[0]` for default dates,
 * "today/historical/future" comparisons, and anywhere the *school's* current
 * date matters. The raw ISO approach returns the wrong day after 23:00 local
 * time in winter and after 00:00 local time in summer, because the server
 * clock is UTC.
 */
export function todayInSchoolTz(): string {
  const p = partsInSchoolTz(new Date())
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`
}

/**
 * Current wall-clock time in Europe/London as `HH:MM`.
 *
 * Use as the `defaultValue` for `<input type="time">` (e.g. the staff sign-in
 * form) so the prefilled time matches the user's local clock rather than the
 * server's UTC clock.
 */
export function nowTimeInSchoolTz(): string {
  const p = partsInSchoolTz(new Date())
  return `${pad2(p.hour)}:${pad2(p.minute)}`
}

/**
 * Current moment in Europe/London formatted as `YYYY-MM-DDTHH:MM`.
 *
 * Use as the `defaultValue` for `<input type="datetime-local">` inputs
 * (incidents, parent-notified time). Replaces the ad-hoc
 * `new Date(... - getTimezoneOffset())` pattern which depends on the
 * *browser's* timezone and is server-rendered incorrectly.
 */
export function nowDatetimeLocalInSchoolTz(): string {
  const p = partsInSchoolTz(new Date())
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`
}

/**
 * Convert a stored UTC timestamp to `YYYY-MM-DDTHH:MM` in Europe/London for
 * populating `<input type="datetime-local">` when editing a record.
 *
 * Use instead of `value.slice(0, 16)` — the slice only works accidentally
 * when the value was stored wall-clock-as-UTC, and breaks as soon as storage
 * is correct.
 */
export function toDatetimeLocalInSchoolTz(utcIso: string): string {
  const p = partsInSchoolTz(new Date(utcIso))
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`
}

/**
 * Format a stored UTC timestamp as `HH:MM` in Europe/London.
 *
 * Use for sign-in/sign-out badges and any time-only display of a stored
 * `timestamptz` value. Output is stable across DST: an entry made at 09:00
 * in summer will still display 09:00 when viewed in winter.
 */
export function formatTimeInSchoolTz(utcIso: string): string {
  const p = partsInSchoolTz(new Date(utcIso))
  return `${pad2(p.hour)}:${pad2(p.minute)}`
}

/**
 * Format a stored UTC timestamp as a date in Europe/London.
 *
 * Use for rendering `timestamptz` columns like `incident_date` where the
 * calendar-day of the entry must not drift across DST. Defaults to
 * `en-GB` short date; pass options for weekday/long month etc.
 */
export function formatDateInSchoolTz(
  utcIso: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TIMEZONE,
    ...options,
  }).format(new Date(utcIso))
}

/**
 * Format a stored UTC timestamp as a full date-and-time in Europe/London.
 *
 * Use for audit-ish lines like "Created on ... by ..." where both date and
 * time matter. Replaces `new Date(ts).toLocaleString('en-GB')`, which uses
 * the viewer's local timezone.
 */
export function formatDateTimeInSchoolTz(utcIso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(utcIso))
}

/**
 * Format a date-only string (`YYYY-MM-DD`, e.g. `lesson_date`, `attendance.date`)
 * for display. The string has no timezone semantics — this helper just parses
 * the components and formats them via `Intl.DateTimeFormat` without any
 * instant-based conversion, so the rendered day always matches the stored day.
 *
 * Use for fields stored as `DATE` / `YYYY-MM-DD` strings. Do NOT use for
 * `timestamptz` values — use {@link formatDateInSchoolTz} for those.
 *
 * @param dateStr - `YYYY-MM-DD`.
 * @param options - passed through to `Intl.DateTimeFormat` (`en-GB`).
 */
export function formatCalendarDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return dateStr
  const [, y, m, d] = match
  // Anchor at noon UTC so any later timezone-aware formatting still resolves
  // to the same calendar day for UK-adjacent zones.
  const instant = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12))
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TIMEZONE,
    ...options,
  }).format(instant)
}
