export const POLICIES_PATH = '/policies'
export const POLICIES_LINK_LABEL = 'Policies & Privacy'

export const policyPath = (slug: string): string => `${POLICIES_PATH}/${slug}`

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
