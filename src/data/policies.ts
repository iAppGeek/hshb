export const POLICIES_PATH = '/policies'

// Slugs of the Contentful `policy` entries that the site links to directly.
// The /policies index lists every published policy, so a new entry only
// needs adding here if it should also be linked from the footer.
export const SCHOOL_POLICIES_SLUG = 'school-policies'
export const PRIVACY_POLICY_SLUG = 'privacy-policy'
export const STAFF_PRIVACY_POLICY_SLUG = 'staff-privacy-policy'

export const policyPath = (slug: string): string => `${POLICIES_PATH}/${slug}`

export type PolicyLink = {
  id: string
  label: string
  href: string
}

export const POLICY_LINKS: readonly PolicyLink[] = [
  { id: 'policies', label: 'School Policies', href: POLICIES_PATH },
  {
    id: 'privacy-policy',
    label: 'Privacy Notice',
    href: policyPath(PRIVACY_POLICY_SLUG),
  },
] as const

// Contentful Date fields without a time are `YYYY-MM-DD`, which `Date`
// parses as UTC midnight — format in UTC so the day never shifts.
export const formatPolicyDate = (isoDate: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoDate))

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

// Only safe characters go into the Content-Disposition header, so an
// editor-supplied file name can't break out of the quoted value.
export const safePdfFileName = (fileName: string): string => {
  const cleaned = fileName.replace(/[^A-Za-z0-9._-]/g, '_')
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`
}
