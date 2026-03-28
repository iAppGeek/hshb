type SupabaseError = {
  code: string
  message: string
  details?: string
}

function isSupabaseError(err: unknown): err is SupabaseError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as SupabaseError).code === 'string'
  )
}

function extractColumnFromDetail(details: string): string | null {
  const match = details.match(/Key \((\w+)\)/)
  return match ? match[1].replace(/_/g, ' ') : null
}

export function getUserFriendlyDbError(err: unknown, fallback: string): string {
  if (!isSupabaseError(err)) return fallback

  console.error('[DB Error]', {
    code: err.code,
    message: err.message,
    details: err.details,
  })

  switch (err.code) {
    case '23505': {
      const column = err.details ? extractColumnFromDetail(err.details) : null
      return column
        ? `A record with this ${column} already exists.`
        : 'A record with this value already exists.'
    }
    case '23503':
      return 'This record is linked to other data and cannot be changed this way.'
    case '23502':
      return 'A required field is missing.'
    case '23514':
      return 'A value does not meet the required conditions.'
    default:
      return fallback
  }
}
