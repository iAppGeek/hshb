// Repo-wide guard: scans every src/ file, so it lives at src/ root rather
// than co-located with any one source file.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

import { describe, it, expect } from 'vitest'

// Credentials that must only ever exist on the server.
// Adding NEXT_PUBLIC_ to any of these would broadcast them to every visitor.
const SECRET_VARS = [
  'CONTENTFUL_TOKEN', // read access to Contentful CMS content delivery API
]

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

const clientFiles = allFiles.filter((f) =>
  readFileSync(f, 'utf-8').trimStart().startsWith("'use client'"),
)

describe('Secret environment variables', () => {
  it('are not prefixed with NEXT_PUBLIC_ (which would expose them to the browser)', () => {
    for (const varName of SECRET_VARS) {
      expect(
        varName,
        `${varName} must not start with NEXT_PUBLIC_`,
      ).not.toMatch(/^NEXT_PUBLIC_/)
    }
  })

  it('.env.local.example does not accidentally use NEXT_PUBLIC_ prefix on secrets', () => {
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

describe('Client components', () => {
  it('do not reference secret environment variable names', () => {
    for (const file of clientFiles) {
      const content = readFileSync(file, 'utf-8')
      for (const varName of SECRET_VARS) {
        expect(
          content,
          `${file} is a client component but references ${varName}`,
        ).not.toContain(varName)
      }
    }
  })
})
