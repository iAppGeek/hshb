# Project: hshb

## Stack

- Next.js 16 with App Router and Turbopack
- React 19, TypeScript, Tailwind CSS
- Supabase for database (`src/db/`)
- NextAuth for authentication (`src/auth/`)
- Vitest for unit/component tests, Playwright for E2E (`e2e/tests/**/*.e2e.ts`), ESLint + Prettier
- Deployed on Netlify

## Folder Structure

- `src/components/` — shared, reusable UI components (server components by default)
- `src/clientComponents/` — client components that require `"use client"`
- `src/sections/` — page-level layout sections (Hero, Footer, Navbar etc.)
- `src/db/` — all Supabase database queries, one file per domain
- `src/data/` — external data fetching (Contentful, events, numbers)
- `src/auth/` — NextAuth config and helpers
- `src/lib/` — shared utilities and business logic
- `src/types/` — shared TypeScript types and declarations
- `src/app/` — Next.js App Router pages and API routes
- `e2e/` — Playwright E2E (`e2e/tests/**/*.e2e.ts`), auth setup, fixtures, seed helpers

## Key Rules

- Before creating a new utility, check `src/lib/` first
- Before creating a new component, check `src/components/` and `src/clientComponents/`
- New database queries go in the relevant file in `src/db/` — never inline in components
- Client components (`"use client"`) go in `src/clientComponents/`, not `src/components/`
- API routes go under `src/app/api/`
- New **user-facing** features should include **Playwright** tests (`*.e2e.ts` under `e2e/tests/`) and **Vitest** for units/components (`*.spec.ts` / `*.spec.tsx` in `src/`)

## Imports

- Never add imports inline or mid-file — always place them with the existing import block at the top of the file

## Supabase

- Use the Supabase MCP to inspect tables and schema before writing any queries
- Never write queries based on assumptions — always verify column names via MCP first
- All database queries go in `src/db/` — one file per domain (students, staff, classes etc.)
- The Supabase MCP is read-only — it cannot modify the database directly
- Schema changes must go through `supabase/schema.sql` and be applied via the Supabase dashboard or CLI

## Database Types

- `src/types/database.ts` is auto-generated — NEVER edit it manually
- To regenerate after schema changes, run manually: `npx supabase gen types typescript --schema public > src/types/database.ts`

## Supabase Mock Pattern

- Never create a real Supabase connection in tests.
- Always mock the Supabase client by importing from the relative path to `src/db/client.ts`:

```typescript
vi.mock('@/db/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}))
```

## Work quality

- Do not leave **TODO** comments — implement, remove, or track outside the codebase.
- Do not consider work complete until **`npm run pipeline:check`** passes.

## Verification

- Run `npm run fix:all` after substantive edits (ESLint + Prettier, including `e2e/**/*.ts` and `playwright.config.ts`).
- Run `npm run pipeline:check` before finishing — lint → format:check → type-check → test:coverage → test:e2e → build
