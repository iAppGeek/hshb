# Project: hshb

## Stack

- Next.js 16 with App Router and Turbopack
- React 19, TypeScript, Tailwind CSS
- Supabase for database (`src/db/`)
- NextAuth for authentication (`src/auth/`)
- Vitest for testing, ESLint + Prettier for code quality
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

## Key Rules

- Before creating a new utility, check `src/lib/` first
- Before creating a new component, check `src/components/` and `src/clientComponents/`
- New database queries go in the relevant file in `src/db/` — never inline in components
- Client components (`"use client"`) go in `src/clientComponents/`, not `src/components/`
- API routes go under `src/app/api/`

## Imports

- All imports must be at the top of the file, before any other code
- Never add imports inline or mid-file — always place them with the existing import block

## Testing

- Every new function or component must have a corresponding test file
- Test files use `.spec.tsx` / `.spec.ts` suffix alongside the source file
- Component tests use React Testing Library
- Never use `jest.mock()` — always use `vi.mock()`, `vi.spyOn()` or `vi.fn()`

## Supabase

- Use the Supabase MCP to inspect tables and schema before writing any queries
- Never write queries based on assumptions — always verify column names via MCP first
- All database queries go in `src/db/` — one file per domain (students, staff, classes etc.)
- The Supabase MCP is read-only — it cannot modify the database directly
- Schema changes must go through `supabase/schema.sql` and be applied via the Supabase dashboard or CLI

## Database Types

- `src/types/database.ts` is auto-generated — NEVER edit it manually
- To regenerate after schema changes, use the Supabase MCP `generate_typescript_types` tool
- Or run manually: `npx supabase gen types typescript --schema public > src/types/database.ts`

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

## Verification

- Run `npm run pipeline:check` after every change
- This runs: lint → format:check → type-check → test:coverage → build
- Fix all failures immediately — do not move on to the next task until all pass
