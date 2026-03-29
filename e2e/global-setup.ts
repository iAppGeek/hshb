import { execSync } from 'child_process'

export default async function globalSetup(): Promise<void> {
  // Verify local Supabase is reachable before running any tests
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch {
    throw new Error(
      `Supabase is not running or unreachable at ${url}.\nRun: npm run supabase:start`,
    )
  }

  // Reset DB to clean seed state before the full test suite
  execSync('npx supabase db reset --local', { stdio: 'inherit' })
}
