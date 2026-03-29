# Integration Test Plan: Playwright E2E Tests for HSHB Portal

## Context

The HSHB portal has 579+ unit tests via Vitest but zero integration/E2E tests. Unit tests mock all external dependencies (Supabase, NextAuth), so there's no verification that the full stack works together — auth flow, database queries, permission enforcement in the browser, responsive layout, and form submissions. This plan adds Playwright-based integration tests that run against a local Supabase database, testing every portal feature across all 4 roles and both desktop/mobile viewports.

---

## 1. Infrastructure Setup

### 1A. Supabase Local Development (Temp Test Database)

The project has `supabase/schema.sql` but no local dev setup. We'll use the Supabase CLI + Docker to spin up an isolated local PostgreSQL instance.

**Steps:**

1. Install Supabase CLI: `npm install -D supabase`
2. Run `npx supabase init` to generate `supabase/config.toml`
3. Copy `supabase/schema.sql` to `supabase/migrations/00000000000000_initial_schema.sql`
4. Create `supabase/seed.sql` with test data (see Section 6)
5. `supabase start` launches local Postgres + API on `http://127.0.0.1:54321`
6. `supabase db reset` applies migrations + seed — fully reproducible test state

**Files created/modified:**

- `supabase/config.toml` (generated, then customized)
- `supabase/migrations/00000000000000_initial_schema.sql` (copy of schema.sql)
- `supabase/seed.sql` (test data)

### 1B. Playwright Setup

**Install:**

```bash
npm install -D @playwright/test dotenv-cli
npx playwright install --with-deps chromium
```

**New file: `playwright.config.ts`**

Key design decisions:

- **Projects matrix**: 4 roles x 2 viewports = 8 test projects, plus 4 auth setup projects
- **Desktop**: `devices['Desktop Chrome']` (1280x720)
- **Mobile**: `devices['iPhone 13']` (390x844)
- Each role gets its own `storageState` file produced by `auth.setup.ts`
- `webServer` command: `dotenv -e .env.e2e -- npm run dev` (loads E2E env vars into the Next.js dev server)
- `globalSetup` runs `supabase db reset` to ensure clean state

```ts
projects: [
  // Single auth setup project — creates storageState for all 4 roles
  {
    name: 'setup',
    testMatch: /auth\.setup\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },

  // Desktop tests per role (all depend on setup)
  {
    name: 'desktop:admin',
    dependencies: ['setup'],
    use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
  },
  {
    name: 'desktop:teacher',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/teacher.json',
    },
  },
  {
    name: 'desktop:headteacher',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/headteacher.json',
    },
  },
  {
    name: 'desktop:secretary',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/secretary.json',
    },
  },

  // Mobile tests per role (all depend on setup)
  {
    name: 'mobile:admin',
    dependencies: ['setup'],
    use: { ...devices['iPhone 13'], storageState: 'e2e/.auth/admin.json' },
  },
  {
    name: 'mobile:teacher',
    dependencies: ['setup'],
    use: { ...devices['iPhone 13'], storageState: 'e2e/.auth/teacher.json' },
  },
  {
    name: 'mobile:headteacher',
    dependencies: ['setup'],
    use: {
      ...devices['iPhone 13'],
      storageState: 'e2e/.auth/headteacher.json',
    },
  },
  {
    name: 'mobile:secretary',
    dependencies: ['setup'],
    use: { ...devices['iPhone 13'], storageState: 'e2e/.auth/secretary.json' },
  },
]
```

The single setup project runs `auth.setup.ts` which loops over all 4 roles, creating a storageState file for each. All 8 test projects depend on it.

**New package.json scripts:**

```json
"test:e2e": "dotenv -e .env.e2e -- playwright test",
"test:e2e:ui": "dotenv -e .env.e2e -- playwright test --ui",
"supabase:start": "supabase start",
"supabase:stop": "supabase stop",
"supabase:reset": "supabase db reset"
```

**Update `pipeline:check`** to include E2E:

```json
"pipeline:check": "npm run lint && npm run format:check && npm run type-check && npm run test:coverage && npm run test:e2e && npm run build"
```

**Prerequisite guard**: `e2e/global-setup.ts` verifies local Supabase is reachable at `http://127.0.0.1:54321` (throws: "Supabase is not running. Run `npm run supabase:start` first.")

This ensures `pipeline:check` fails fast with a clear message rather than cryptic connection errors.

**Add to `.gitignore`:** `e2e/.results/`, `e2e/.report/`, `e2e/.auth/`

---

## 2. Auth Strategy: Test-Only CredentialsProvider

Since auth uses Microsoft Entra ID (OAuth), we can't do real OAuth in automated tests. The solution: add a **CredentialsProvider gated by `E2E_TEST=true`** env var.

### Modify: `src/auth/config.ts`

Add a conditional `Credentials` provider that:

- Only loads when `process.env.E2E_TEST === 'true'`
- Accepts email + a static test secret (`E2E_TEST_SECRET`)
- Looks up the staff record via `getStaffByEmail()` (same as production flow)
- Returns the same user object, so JWT/session callbacks enrich it identically

```ts
import Credentials from 'next-auth/providers/credentials'

const providers: Provider[] = [
  MicrosoftEntraID({ ... }),  // existing
]

if (process.env.E2E_TEST === 'true') {
  providers.push(
    Credentials({
      id: 'test-credentials',
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (credentials?.password !== process.env.E2E_TEST_SECRET) return null
        const staff = await getStaffByEmail(credentials.email as string)
        if (!staff) return null
        return { id: staff.id, email: staff.email, name: `${staff.first_name} ${staff.last_name}` }
      },
    })
  )
}
```

**Safety:** `E2E_TEST` is never set in production (Netlify). The `signIn` callback still validates against the staff table. JWT/session callbacks are unchanged.

### Modify: `src/app/portal/login/page.tsx`

Add a hidden test login form (only renders when `E2E_TEST=true`):

```tsx
{process.env.E2E_TEST === 'true' && (
  <form action={...signIn('test-credentials')} data-testid="test-login-form">
    <input name="email" data-testid="test-email" />
    <input name="password" type="password" data-testid="test-password" />
    <button data-testid="test-login-button">Test Login</button>
  </form>
)}
```

### New file: `e2e/auth.setup.ts`

Logs in as each role, saves `storageState` for reuse by all subsequent tests:

```ts
const TEST_USERS = {
  admin: 'admin@test.hshb.local',
  teacher: 'teacher@test.hshb.local',
  headteacher: 'headteacher@test.hshb.local',
  secretary: 'secretary@test.hshb.local',
}
// Each setup navigates to /portal/login, fills the test form, submits, waits for dashboard, saves cookies
```

### New file: `.env.e2e` (committed — all values are local/non-secret)

```env
E2E_TEST=true
E2E_TEST_SECRET=e2e-test-secret-hshb
AUTH_SECRET=e2e-auth-secret-for-jwt-signing
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

All values are hardcoded and safe to commit:

- `E2E_TEST_SECRET` — arbitrary string, only gates the test login form
- `AUTH_SECRET` — signs test JWTs locally, not a production secret
- `SUPABASE_SERVICE_ROLE_KEY` — the well-known default key for every local Supabase instance (same for all developers)

No `.env.e2e.example` needed. No developer setup step beyond `supabase start`.

---

## 3. Test Directory Structure

```
e2e/
  auth.setup.ts                     # Produces storageState for each role
  global-setup.ts                   # Runs `supabase db reset` before suite
  fixtures/
    index.ts                        # Custom fixtures (isMobile helper, supabase client)
    seed.ts                         # Direct DB helpers for per-test cleanup
  tests/
    auth/
      login.spec.ts                 # Login flow, unauthorized access, redirect
    navigation/
      sidebar.spec.ts               # Sidebar items per role, mobile drawer toggle
    permissions/
      entitlements.spec.ts          # Full route-access matrix for all 4 roles
    dashboard/
      dashboard.spec.ts             # Cards and data visibility per role
    students/
      students-list.spec.ts         # Listing, search, role-based filtering
      students-create.spec.ts       # Create form (admin only)
      students-edit.spec.ts         # Edit form (admin only)
    staff/
      staff-list.spec.ts            # Listing, contact visibility per role
      staff-create.spec.ts          # Create (admin only)
      staff-edit.spec.ts            # Edit (admin only)
    classes/
      classes-list.spec.ts
      classes-create.spec.ts        # Admin + headteacher
      classes-edit.spec.ts          # Admin + headteacher
    attendance/
      attendance.spec.ts            # Register selection, save, role restrictions
    staff-attendance/
      staff-attendance.spec.ts      # Sign-in/out, self-only for teacher/secretary
    incidents/
      incidents-list.spec.ts
      incidents-create.spec.ts      # All authenticated roles
      incidents-edit.spec.ts        # Admin + headteacher only
    lesson-plans/
      lesson-plans-list.spec.ts
      lesson-plans-create.spec.ts   # Teacher (own classes), admin, headteacher
      lesson-plans-edit.spec.ts
    guardians/
      guardians-edit.spec.ts        # Admin only
    timetables/
      timetables.spec.ts            # Slot visibility per role
    reports/
      reports.spec.ts               # Admin, headteacher, secretary only
```

---

## 4. Desktop vs Mobile Testing

Every spec runs automatically in both desktop and mobile Playwright projects (via the config matrix). Tests use a custom `isMobile` fixture to handle viewport-specific assertions:

**Desktop assertions:**

- Sidebar permanently visible
- Full table columns with headers
- "Add" buttons in their desktop positions

**Mobile assertions:**

- Top bar with hamburger menu visible
- Sidebar hidden by default, opens as drawer on tap
- Card-based layout replacing tables
- Drawer closes after navigation

```ts
// e2e/fixtures/index.ts
export const test = base.extend<{ isMobile: boolean }>({
  isMobile: async ({ page }, use) => {
    const vp = page.viewportSize()
    await use(vp ? vp.width < 768 : false)
  },
})
```

---

## 5. Tests to Write (by priority)

### Priority 1: Auth & Permissions (Foundation)

**`login.spec.ts`** — Unauthenticated redirect to login, successful login, invalid credentials, unknown email rejected

**`entitlements.spec.ts`** — Full route-access matrix:
| Route | admin | headteacher | teacher | secretary |
|---|---|---|---|---|
| `/portal/students/new` | allowed | redirect | redirect | redirect |
| `/portal/staff/new` | allowed | redirect | redirect | redirect |
| `/portal/classes/new` | allowed | allowed | redirect | redirect |
| `/portal/lesson-plans/new` | allowed | allowed | allowed | redirect |
| `/portal/reports` | allowed | allowed | redirect | allowed |
| `/portal/guardians/{id}/edit` | allowed | redirect | redirect | redirect |
| (all other portal pages) | allowed | allowed | allowed | allowed |

**`sidebar.spec.ts`** — Nav items per role (Reports only for admin/headteacher/secretary), notification toggle only for admin/headteacher, sign-out works, mobile drawer open/close

### Priority 2: Data Visibility & Filtering per Role

These tests verify that each role sees the correct data and UI controls. The seed data has 2 teachers (teacher1 owns Alpha with Alice+Bob, teacher2 owns Beta with Carol), so teacher-level filtering is testable.

**Note on headteacher permissions**: Headteacher has split edit access per the codebase:

- **CAN edit**: classes, incidents, lesson plans, timetables (`canEditClasses`, `canEditIncidents`, etc.)
- **CANNOT edit**: students, staff, guardians (admin-only)

The assertion tables below reflect the actual code, not a simplified model.

**`students-list.spec.ts` — Student visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees Alice, Bob, Carol (all students) | yes | yes | yes | no |
| Teacher sees only own class students (Alice, Bob) | n/a | n/a | n/a | yes |
| "Add student" button is a clickable link | yes | no (disabled tooltip) | no (disabled tooltip) | no (hidden) |
| "Edit" link visible on each row | yes | no | no | no |
| Medical/allergy info columns visible | yes | yes | yes | no (`canSeeStudentMedical`) |

**`staff-list.spec.ts` — Staff visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees all 5 staff members | yes | yes | yes | yes |
| Contact number column visible | yes | yes | yes | no (`canSeeStaffContact`) |
| "Add staff" button is a clickable link | yes | no (disabled tooltip) | no (disabled tooltip) | no (hidden) |
| "Edit" link visible on each row | yes | no | no | no |

**`classes-list.spec.ts` — Class visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees all 3 classes (Alpha, Beta, Gamma) | yes | yes | yes | no |
| Teacher sees only own class (Alpha) | n/a | n/a | n/a | yes |
| "Add class" button is a clickable link | yes | yes | no (disabled tooltip) | no (hidden) |
| "Edit" link visible on each row | yes | yes | no | no |
| Teacher name shown on each class | yes | yes | yes | yes |
| Student count shown on each class | yes | yes | yes | yes |

**`attendance.spec.ts` — Class selector filtering:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Class dropdown shows all classes | yes | yes | yes | no |
| Teacher dropdown shows only own class | n/a | n/a | n/a | yes |
| Can save attendance (toggle + submit) | yes | yes | new only | yes |

**`incidents-list.spec.ts` — Incident visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees all incidents | yes | yes | yes | own students only |
| "Edit" link visible | yes | yes | no | no |
| "New incident" button visible | yes | yes | yes | yes |

**`lesson-plans-list.spec.ts` — Lesson plan visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees all lesson plans | yes | yes | yes | own classes only |
| "Create" button visible | yes | yes | no | yes |
| "Edit" link visible | yes | yes | no | own only |
| Teacher class dropdown on create: all classes | yes | yes | n/a | own classes only |

**`staff-attendance.spec.ts` — Staff sign-in/out visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees all non-admin staff on the sheet | yes | yes | yes | no |
| Teacher sees only own row | n/a | n/a | n/a | yes |
| Can sign in/out any staff member | yes | yes | no | no |
| Can sign in/out self only | n/a | n/a | yes | yes |
| Date picker visible | yes | yes | yes | yes |

Note: `showsOnSignInSheet(role)` returns `role !== 'admin'` — so admin does NOT appear on the sign-in sheet, but all other roles do.

**`timetables.spec.ts` — Timetable visibility:**
| Assertion | admin | headteacher | secretary | teacher |
|---|---|---|---|---|
| Sees all timetable slots across classes | yes | yes | yes | no |
| Teacher sees only own class slots | n/a | n/a | n/a | yes |
| Slots grouped by day of week | yes | yes | yes | yes |

### Priority 3: CRUD Workflow Tests

**Students create/edit:** Admin submits create form successfully, edit form loads with existing data, validation errors display. Headteacher/teacher/secretary get redirected from `/students/new`.

**Staff create/edit:** Admin only. Same pattern as students.

**Classes create/edit:** Admin and headteacher can create/edit. Teacher/secretary redirected.

**Attendance save:** Toggle statuses, submit, reload page to verify persistence. Teacher submits for own class only.

**Staff Attendance:** Teacher signs self in/out only. Admin/headteacher manage all staff.

**Incidents create/edit:** All roles create. Only admin/headteacher can edit existing.

**Lesson Plans create/edit:** Teacher creates for own class, admin/headteacher for any class. Duplicate class+date rejected with error.

**Guardians edit:** Admin only. All others redirected from `/guardians/{id}/edit`.

### Priority 4: Reports & Dashboard

**Reports:** Role-gated access (admin/headteacher/secretary), teacher redirected. Date/mode selection changes data.

**Dashboard:** Role-appropriate cards and counts. Teacher sees "My Students"/"My Classes" only.

### Actions Testing

Each CRUD test naturally covers the server action by submitting the form and verifying the result. The key action-level tests:

- Permission denied returns error (e.g., teacher trying to create student via direct form post)
- Zod validation errors display in the form
- Audit log entries created (verify via direct DB query in test helper)
- `revalidatePath` causes fresh data on redirect

---

## 6. Seed Data (`supabase/seed.sql`)

Minimal but sufficient test data:

- **5 staff**: 1 admin, 2 teachers, 1 headteacher, 1 secretary (deterministic UUIDs)
- **3 classes**: Alpha (teacher1), Beta (teacher2), Gamma (headteacher)
- **3 students**: Alice + Bob in Alpha, Carol in Beta
- **3 guardians**: One per student
- **3 student_classes** enrollments
- **3 timetable_slots**
- **2 incidents**: 1 medical, 1 behaviour
- **1 lesson_plan**: For Alpha class

All IDs use deterministic UUIDs (`00000000-...`, `10000000-...`, etc.) for reliable assertions.

### Data Isolation

- `e2e/global-setup.ts` runs `supabase db reset` before the entire suite
- Mutation tests that create records use `test.afterEach` to clean up via a direct Supabase client in `e2e/fixtures/seed.ts`
- Read-only tests run first (Playwright project ordering), mutation tests after

---

## 7. CI/CD Integration

### GitHub Actions: `.github/workflows/e2e.yml`

```yaml
- supabase/setup-cli@v1 # Install Supabase CLI
- supabase start # Start local Postgres (Docker available in GH Actions)
- supabase db reset # Apply migrations + seed
- npx playwright install --with-deps chromium
- npx playwright test # With E2E env vars
- Upload playwright report as artifact on failure
```

**Not run in Netlify build** (no Docker available there).

---

## 8. Files to Create/Modify

### New files:

- `playwright.config.ts`
- `.env.e2e` (committed — all local/non-secret values)
- `e2e/auth.setup.ts`
- `e2e/global-setup.ts`
- `e2e/fixtures/index.ts`
- `e2e/fixtures/seed.ts`
- `e2e/tests/**/*.spec.ts` (all test files listed in Section 3)
- `supabase/config.toml` (generated)
- `supabase/migrations/00000000000000_initial_schema.sql`
- `supabase/seed.sql`
- `.github/workflows/e2e.yml`

### Modified files:

- `src/auth/config.ts` — Add conditional CredentialsProvider
- `src/app/portal/login/page.tsx` — Add conditional test login form
- `package.json` — Add scripts + `@playwright/test` + `dotenv-cli` deps
- `.gitignore` — Add e2e output dirs

---

## 9. Implementation Order (Incremental)

**Phase 1 — Foundation (this session):**

1. Supabase local setup (config, migration, seed)
2. Install Playwright + `dotenv-cli`, create `playwright.config.ts`
3. Modify `src/auth/config.ts` — add test CredentialsProvider
4. Modify `src/app/portal/login/page.tsx` — add test login form
5. Create `.env.e2e`, `e2e/global-setup.ts`, `e2e/auth.setup.ts`, `e2e/fixtures/`
6. Update `package.json` scripts including `pipeline:check`
7. Update `.gitignore`
8. Write first tests: `login.spec.ts`, `entitlements.spec.ts`, `sidebar.spec.ts`
9. Verify everything works end-to-end

**Phase 2 — Read-only page tests (follow-up):**

- List pages for students, staff, classes, incidents, lesson-plans
- Dashboard, reports, timetables

**Phase 3 — CRUD workflow tests (follow-up):**

- Create/edit tests for each module
- Attendance and staff-attendance tests

**Phase 4 — CI (follow-up):**

- GitHub Actions workflow for automated E2E in CI

---

## 10. Coding Conventions (from Serena + CLAUDE.md)

All E2E test code must follow the project's established conventions:

- **TypeScript strict mode** — explicit return types on all functions, no `any` (use `unknown` and narrow)
- **Prefer `type` over `interface`** unless extending
- **PascalCase** for types, **camelCase** for functions/variables, **kebab-case** for directories
- **No TODO comments** — implement or skip
- **Path alias**: `@/*` maps to `./src/*` (used in app code, not in E2E tests which are outside `src/`)
- **ESLint + Prettier** — all new files must pass `npm run lint` and `npm run format:check`
- **Commitlint** — conventional commits enforced (e.g., `feat(e2e): add playwright integration tests`)
- **Test naming**: Use descriptive `test.describe` and `test()` names that read like requirements
- **Selectors**: Prefer `data-testid` attributes and accessible roles (`getByRole`, `getByLabel`) over CSS selectors
- **Assertions**: Use Playwright's built-in `expect(page)` and `expect(locator)` matchers with auto-retry

---

## 11. Known Risks & Mitigations

| Risk                                                                                       | Mitigation                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NextAuth JWT signing** — storageState cookies must be signed with the same `AUTH_SECRET` | `.env.e2e` sets a deterministic `AUTH_SECRET`; the dev server and auth setup both use it                                                             |
| **`server-only` import in `src/db/client.ts`**                                             | Not an issue — E2E tests interact via the browser, never import app code directly. The `e2e/fixtures/seed.ts` helper creates its own Supabase client |
| **Race conditions after form submit**                                                      | Always `await page.waitForURL(...)` after actions that trigger `redirect()`, never rely on timing                                                    |
| **Time-sensitive tests** (attendance, dashboard "today")                                   | Seed uses `CURRENT_DATE`/`NOW()` in SQL. Consider `page.clock.setFixedTime()` if flaky across midnight                                               |
| **Docker not running**                                                                     | `global-setup.ts` checks Supabase health endpoint and throws descriptive error before tests run                                                      |
| **Netlify build**                                                                          | E2E tests only run locally and in GitHub Actions (Docker available). Netlify continues running unit tests only                                       |

---

## 12. Verification

After implementation, verify by:

1. `supabase start && supabase db reset` — local DB spins up and seeds
2. `npm run test:e2e` — all tests pass across all 8 projects (4 roles x 2 viewports)
3. `npm run test:e2e:ui` — visual Playwright UI shows tests grouped by project
4. `npm run pipeline:check` — existing unit tests + build still pass (auth changes don't break anything because `E2E_TEST` is not set)
5. Push to a PR branch — GitHub Actions runs E2E in CI
