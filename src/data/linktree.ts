export const SCHOOL_EMAIL = 'info@hshb.org.uk'
export const STAFF_EMAIL_DOMAIN = 'hshb.org.uk'

const LOCAL_PART_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/

const firstValue = (raw: string | string[] | undefined): string | null => {
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' ? value.trim().toLowerCase() : null
}

/**
 * Extracts and validates the local part of a staff email from the `t` query
 * param. Only a restricted charset is accepted so the value is safe to embed
 * in a `mailto:` CC field without allowing header/param injection.
 */
export const parseStaffLocalPart = (
  raw: string | string[] | undefined,
): string | null => {
  const value = firstValue(raw)
  if (!value || !LOCAL_PART_PATTERN.test(value)) return null
  return value
}

export const parseStaffEmail = (
  raw: string | string[] | undefined,
): string | null => {
  const localPart = parseStaffLocalPart(raw)
  return localPart ? `${localPart}@${STAFF_EMAIL_DOMAIN}` : null
}

export const buildContactMailto = (staffEmail: string | null): string => {
  const params = [`subject=${encodeURIComponent('Enquiry from a parent')}`]
  if (staffEmail) params.push(`cc=${encodeURIComponent(staffEmail)}`)
  return `mailto:${SCHOOL_EMAIL}?${params.join('&')}`
}

export type LinktreeLink = {
  id: string
  label: string
  href: string
  external: boolean
}

// Order matches the requested display order: Visit Website, Contact Us
// (rendered separately in LinkTree.tsx since its href is built at runtime
// from the staff email), Register Student, ClassDojo Family Registration.
export const LINKS: readonly LinktreeLink[] = [
  {
    id: 'homepage',
    label: 'Visit Website',
    href: '/',
    external: false,
  },
  {
    id: 'registration',
    label: 'Register Student',
    href: 'https://portal.hshb.org.uk/register',
    external: true,
  },
  {
    id: 'dojo-school-signup',
    label: 'ClassDojo Family Registration',
    href: 'https://www.classdojo.com/ul/p/addKid?target=school&schoolID=561ab2860a93dff956cace93',
    external: true,
  },
] as const

export type LinktreeSocialLink = {
  id: string
  label: string
  href: string
}

// Rendered as a row of icon-only links, alongside the school's other
// social links, matching the Navbar's icon treatment.
export const SOCIAL_LINKS: readonly LinktreeSocialLink[] = [
  {
    id: 'dojo-parent-login',
    label: 'ClassDojo — Parent Sign In',
    href: 'https://dojo.hshb.org.uk/',
  },
  {
    id: 'instagram',
    label: 'Follow us on Instagram',
    href: 'https://instagram.hshb.org.uk/',
  },
  {
    id: 'facebook',
    label: 'Like us on Facebook',
    href: 'https://facebook.hshb.org.uk/',
  },
  {
    id: 'x',
    label: 'Follow us on X',
    href: 'https://x.hshb.org.uk/',
  },
] as const
