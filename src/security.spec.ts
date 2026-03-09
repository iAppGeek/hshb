import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

import { describe, it, expect } from 'vitest'

// ─── What these tests guard against ──────────────────────────────────────────
//
// In Next.js, any environment variable prefixed with NEXT_PUBLIC_ is embedded
// into the client-side JavaScript bundle and sent to every browser. Variables
// without that prefix are server-only and never leave the server.
//
// These tests make sure that credentials (API keys, secrets, tokens) can never
// accidentally be exposed to the browser — either through a misnamed variable,
// a bad import in a client component, or a copy-paste mistake in the env template.
//
// They run as part of the normal test suite, so a failing security check will
// block a Netlify deploy before any code reaches production.
// ─────────────────────────────────────────────────────────────────────────────

// Credentials that must only ever exist on the server.
// Adding NEXT_PUBLIC_ to any of these would broadcast them to every visitor.
const SECRET_VARS = [
  'AUTH_SECRET', // signs and verifies session tokens — anyone with this can forge logins
  'AZURE_AD_CLIENT_SECRET', // authenticates the app with Microsoft — leaking this allows impersonation
  'SUPABASE_SERVICE_ROLE_KEY', // bypasses all database row-level security — full read/write access to all data
  'CONTENTFUL_TOKEN', // read access to Contentful CMS content delivery API
]

// These modules run database queries and auth checks using the secret keys above.
// They must never be imported into a 'use client' file, which runs in the browser.
// Note: `import type` lines are erased by TypeScript before bundling and create
// no runtime dependency, so we strip them before scanning.
const SERVER_ONLY_IMPORTS = ["from '@/db'", "from '@/auth'"]

// Remove type-only import lines so they don't trigger false positives.
// `import type { Foo } from '@/db'` compiles away to nothing — only value
// imports create a real dependency that Next.js would bundle for the browser.
function stripTypeImports(content: string): string {
  return content
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('import type'))
    .join('\n')
}

// Recursively collect all non-test TypeScript source files under src/
function walkSrc(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue
    const full = join(dir, entry.name)
    if (statSync(full).isDirectory()) {
      files.push(...walkSrc(full))
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.spec.tsx')
    ) {
      files.push(full)
    }
  }
  return files
}

const srcDir = join(process.cwd(), 'src')
const allFiles = walkSrc(srcDir)

// Client components are identified by the 'use client' directive at the top of
// the file. These files are bundled and sent to the browser, so they must not
// contain or import anything secret.
const clientFiles = allFiles.filter((f) =>
  readFileSync(f, 'utf-8').trimStart().startsWith("'use client'"),
)

// ─── Env var naming ───────────────────────────────────────────────────────────

describe('Secret environment variables', () => {
  it('are not prefixed with NEXT_PUBLIC_ (which would expose them to the browser)', () => {
    // Next.js statically replaces NEXT_PUBLIC_* variables at build time and
    // inlines their values into the JS bundle. If a secret were ever renamed
    // with that prefix, its value would be visible to anyone who opens
    // DevTools → Sources.
    for (const varName of SECRET_VARS) {
      expect(
        varName,
        `${varName} must not start with NEXT_PUBLIC_`,
      ).not.toMatch(/^NEXT_PUBLIC_/)
    }
  })

  it('.env.local.example does not accidentally use NEXT_PUBLIC_ prefix on secrets', () => {
    // The example file is committed to the repo and used as a setup guide.
    // If someone copy-pastes a variable name from it and accidentally adds
    // NEXT_PUBLIC_, that secret leaks to the browser in production.
    const example = readFileSync(
      join(process.cwd(), '.env.local.example'),
      'utf-8',
    )
    for (const varName of SECRET_VARS) {
      expect(
        example,
        `${varName} must not appear as NEXT_PUBLIC_${varName} in .env.local.example`,
      ).not.toContain(`NEXT_PUBLIC_${varName}`)
    }
  })
})

// ─── Client component isolation ───────────────────────────────────────────────

describe('Client components', () => {
  it('do not import server-only modules (@/db, @/auth)', () => {
    // @/db uses the Supabase service role key to run database queries.
    // @/auth uses the Azure AD client secret to manage sessions.
    // Importing either into a 'use client' file would cause Next.js to bundle
    // those modules — and the secrets they depend on — into the browser build.
    for (const file of clientFiles) {
      const content = stripTypeImports(readFileSync(file, 'utf-8'))
      for (const imp of SERVER_ONLY_IMPORTS) {
        expect(
          content,
          `${file} is a client component but imports ${imp}`,
        ).not.toContain(imp)
      }
    }
  })

  it('do not reference secret environment variable names', () => {
    // A direct reference to process.env.SECRET_VAR inside a client component
    // would cause Next.js to inline the value at build time, exposing it in
    // the browser bundle even without a NEXT_PUBLIC_ prefix.
    for (const file of clientFiles) {
      const content = stripTypeImports(readFileSync(file, 'utf-8'))
      for (const varName of SECRET_VARS) {
        expect(
          content,
          `${file} is a client component but references ${varName}`,
        ).not.toContain(varName)
      }
    }
  })
})

// ─── Supabase client ──────────────────────────────────────────────────────────

describe('Supabase client', () => {
  it('uses the service role key, not the anon/publishable key', () => {
    // The service role key bypasses row-level security and has full database
    // access — it must be used server-side only. The anon key is the public
    // key intended for browser use, but we enforce access control in the
    // application layer instead, so it should never appear here.
    const client = readFileSync(join(srcDir, 'db/client.ts'), 'utf-8')
    expect(client).toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(client).not.toContain('SUPABASE_ANON_KEY')
  })

  it('is not imported by any client component', () => {
    // Even if the Supabase client itself were safe to expose, it is initialised
    // with the service role key (full DB access). Any client component that
    // imports @/db would pull that initialisation — and the key — into the
    // browser bundle.
    for (const file of clientFiles) {
      const content = stripTypeImports(readFileSync(file, 'utf-8'))
      expect(
        content,
        `${file} is a client component but imports from @/db`,
      ).not.toContain("from '@/db'")
    }
  })
})
