/** Rough ceiling for mailto href length across common mail clients and OS limits. */
export const DEFAULT_MAX_MAILTO_LENGTH = 2000

export function normalizeAndDedupeEmails(
  inputs: (string | null | undefined)[],
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of inputs) {
    if (raw == null) continue
    const trimmed = raw.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
  }
  return out
}

export function mailtoWithBcc(
  emails: string[],
  opts?: {
    subject?: string
    body?: string
    maxTotalLength?: number
  },
): string | null {
  const list = normalizeAndDedupeEmails(emails)
  if (list.length === 0) return null

  const params = new URLSearchParams()
  params.set('bcc', list.join(','))
  if (opts?.subject) params.set('subject', opts.subject)
  if (opts?.body) params.set('body', opts.body)

  const href = `mailto:?${params.toString()}`
  const max = opts?.maxTotalLength ?? DEFAULT_MAX_MAILTO_LENGTH
  if (href.length > max) return null
  return href
}

export function staffEmailsForMailto(
  staff: ReadonlyArray<{ email: string; personal_email?: string | null }>,
  includePersonal: boolean,
): string[] {
  const raw: (string | null | undefined)[] = []
  for (const m of staff) {
    raw.push(m.email)
    if (includePersonal) raw.push(m.personal_email)
  }
  return normalizeAndDedupeEmails(raw)
}

export function guardianEmailsForMailto(
  students: ReadonlyArray<{
    primary_guardian?: { email?: string | null } | null
    secondary_guardian?: { email?: string | null } | null
  }>,
): string[] {
  const raw: (string | null | undefined)[] = []
  for (const s of students) {
    raw.push(s.primary_guardian?.email)
    raw.push(s.secondary_guardian?.email)
  }
  return normalizeAndDedupeEmails(raw)
}

function csvEscapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Single-row CSV of email addresses (deduped, RFC 4180–safe fields). */
export function formatEmailsAsCsv(emails: string[]): string {
  return normalizeAndDedupeEmails(emails).map(csvEscapeField).join(',')
}
