import { execSync } from 'child_process'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'

async function waitForSupabase(timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
        },
      })
      if (response.ok) return
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(
    `Supabase did not become ready within ${timeoutMs}ms at ${SUPABASE_URL}.\nRun: npm run supabase:start`,
  )
}

export default async function globalSetup(): Promise<void> {
  // Verify local Supabase is reachable before running any tests
  await waitForSupabase()

  // Reset DB to clean seed state before the full test suite
  execSync('npx supabase db reset --local', { stdio: 'inherit' })

  // db reset restarts containers — wait for Supabase to be ready again
  await waitForSupabase()
}
