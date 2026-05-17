# Project: hshb

## Stack

- Next.js 16 with App Router and Turbopack
- React 19, TypeScript, Tailwind CSS
- Contentful for content (`src/data/`)
- Vitest for unit/component tests, Playwright for E2E (`e2e/tests/**/*.e2e.ts`), ESLint + Prettier
- Deployed on Netlify

## Folder Structure

- `src/components/` — shared, reusable UI components (server components by default)
- `src/clientComponents/` — client components that require `"use client"`
- `src/sections/` — page-level layout sections (Hero, Footer, Navbar etc.)
- `src/data/` — external data fetching (Contentful, events, numbers)
- `src/types/` — shared TypeScript types and declarations
- `src/app/` — Next.js App Router pages and API routes
- `e2e/` — Playwright E2E (`e2e/tests/**/*.e2e.ts`)

## Key Rules

- Before creating a new component, check `src/components/` and `src/clientComponents/`
- Client components (`"use client"`) go in `src/clientComponents/`, not `src/components/`
- API routes go under `src/app/api/`
- New **user-facing** features should include **Playwright** tests (`*.e2e.ts` under `e2e/tests/`) and **Vitest** for units/components (`*.spec.ts` / `*.spec.tsx` in `src/`)

## Imports

- Never add imports inline or mid-file — always place them with the existing import block at the top of the file

## Contentful

- `src/types/contentful/` is auto-generated — NEVER edit any file inside it manually
- To regenerate: `npm run gen:types`
- Requires `CONTENTFUL_MANAGEMENT_TOKEN` (a CMA personal access token, not the CDA delivery token) in `.env.local` — only needed locally; CI uses the committed files

## Work quality

- Do not leave **TODO** comments — implement, remove, or track outside the codebase.
- Do not consider work complete until **`npm run pipeline:check`** passes.

## Verification

- Run `npm run fix:all` after substantive edits (ESLint + Prettier, including `e2e/**/*.ts` and `playwright.config.ts`).
- Run `npm run pipeline:check` before finishing — lint → format:check → type-check → test:coverage → test:e2e → build
