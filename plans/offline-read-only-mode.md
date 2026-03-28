# Plan: Offline Read-Only Mode for HSHB Staff Portal

## Context

Users on iOS PWA report blank screens when offline. Currently the service worker caches navigation HTML (stale-while-revalidate) but does **not** cache RSC payloads (used for client-side navigation) or JS chunks. This means clicking sidebar links offline fails. Additionally, no UI indicates offline state and forms remain active despite being unusable without a network connection.

**Goal:** Make the portal fully browsable offline with cached data, while disabling all write operations and clearly communicating offline status.

**Offline readiness by page:**

- Fully ready (all data in RSC payload): dashboard, students, staff, classes, timetables
- Mostly ready (capped at 50 records): lesson-plans, incidents
- Partial (URL-param driven, only visited combos cached): attendance, staff-attendance, reports

---

## Phase 1: Service Worker — Cache RSC Payloads + JS Chunks

**File:** `public/portal-sw.js`

Bump cache to `hshb-portal-v4`. Add two new handlers before the existing "everything else" fallback:

1. **JS chunks** (`/_next/static/chunks/`): cache-first (content-hashed, immutable)
2. **RSC payloads** (requests with `RSC: 1` header): stale-while-revalidate

Fetch handler order becomes:

1. Skip `/api/` and `/auth/` (existing)
2. Navigation: stale-while-revalidate (existing)
3. CSS/fonts: cache-first (existing)
4. **NEW** — JS chunks: cache-first
5. **NEW** — RSC payloads: stale-while-revalidate
6. Everything else: network-first (existing)

---

## Phase 2: `useOnlineStatus` Hook

**New file:** `src/lib/useOnlineStatus.ts`

Custom hook using `useSyncExternalStore` — the correct React 19 primitive for subscribing to browser `online`/`offline` events. Server snapshot returns `true` (server is always online). Module-level `subscribe`/`getSnapshot` functions (compatible with React Compiler).

No Context provider needed — the portal layout is a server component and cannot render providers without restructuring. Each component imports the hook directly.

**New file:** `src/lib/useOnlineStatus.spec.ts`

Tests (mock `navigator.onLine` via `vi.spyOn`, dispatch `online`/`offline` events):

- returns `true` when `navigator.onLine` is `true`
- returns `false` when `navigator.onLine` is `false`
- re-renders to `false` when `offline` event fires
- re-renders to `true` when `online` event fires
- server snapshot always returns `true`

---

## Phase 3: Offline Banner in Layout

**New file:** `src/app/portal/_components/OfflineBanner.tsx`

Client component using `useOnlineStatus()`. Renders amber warning banner when offline:

> "You are offline — data shown may not be up to date. Editing is disabled until you reconnect."

Styling: `bg-amber-50 border-amber-200 text-amber-800` with `ExclamationTriangleIcon` (already used in the codebase). `print:hidden`.

**File to modify:** `src/app/portal/layout.tsx`

- Import and render `<OfflineBanner />` inside `<main>` after the notification banner Suspense block, before `{children}`

**New file:** `src/app/portal/_components/OfflineBanner.spec.tsx`

Tests (mock `useOnlineStatus` via `vi.mock`):

- renders nothing when online
- renders amber banner with warning text when offline
- banner includes `print:hidden` class

---

## Phase 4: Offline Notice for Forms

**New file:** `src/app/portal/_components/OfflineNotice.tsx`

Small client component — renders `<p className="text-sm text-amber-600">Saving is unavailable while offline.</p>` when `!isOnline`, or `null` when online. Placed near submit buttons in forms.

**New file:** `src/app/portal/_components/OfflineNotice.spec.tsx`

Tests (mock `useOnlineStatus` via `vi.mock`):

- renders nothing when online
- renders "Saving is unavailable while offline" text when offline

---

## Phase 5: `OfflineGuardedLink` Component

**New file:** `src/clientComponents/OfflineGuardedLink.tsx`

Wraps Next.js `Link`. When online → normal `<Link>`. When offline → disabled `<span>` with `<Tooltip text="Unavailable while offline">`, matching the existing permission-denied pattern (used in students/page.tsx, staff/page.tsx, classes/page.tsx). Uses existing `src/components/Tooltip.tsx`.

Placed in `src/clientComponents/` per CLAUDE.md (shared client component).

**New file:** `src/clientComponents/OfflineGuardedLink.spec.tsx`

Tests (mock `useOnlineStatus` via `vi.mock`):

- renders a clickable `<a>` link when online
- renders a disabled `<span>` when offline
- shows tooltip text "Unavailable while offline" when offline
- passes `href`, `className`, and `children` through to `<Link>` when online

---

## Phase 6: Disable Forms When Offline (12 form components)

Per-file change pattern (small, identical for each):

1. `import { useOnlineStatus } from '@/lib/useOnlineStatus'`
2. `const isOnline = useOnlineStatus()`
3. Add `|| !isOnline` to submit button `disabled` prop
4. Render `<OfflineNotice />` near the submit button

| #   | File                                                           | Current disabled                 | New disabled       |
| --- | -------------------------------------------------------------- | -------------------------------- | ------------------ |
| 1   | `src/app/portal/attendance/AttendanceForm.tsx`                 | `isPending \|\| !allSelected`    | `+ \|\| !isOnline` |
| 2   | `src/app/portal/staff-attendance/StaffAttendanceTable.tsx`     | `isPending` (×2: signIn/signOut) | `+ \|\| !isOnline` |
| 3   | `src/app/portal/students/new/AddStudentForm.tsx`               | `isPending`                      | `+ \|\| !isOnline` |
| 4   | `src/app/portal/students/[id]/edit/EditStudentForm.tsx`        | `isPending`                      | `+ \|\| !isOnline` |
| 5   | `src/app/portal/staff/new/AddStaffForm.tsx`                    | `isPending`                      | `+ \|\| !isOnline` |
| 6   | `src/app/portal/staff/[id]/edit/EditStaffForm.tsx`             | `isPending`                      | `+ \|\| !isOnline` |
| 7   | `src/app/portal/classes/ClassForm.tsx`                         | `isPending`                      | `+ \|\| !isOnline` |
| 8   | `src/app/portal/lesson-plans/new/AddLessonPlanForm.tsx`        | `isPending`                      | `+ \|\| !isOnline` |
| 9   | `src/app/portal/lesson-plans/[id]/edit/EditLessonPlanForm.tsx` | `isPending`                      | `+ \|\| !isOnline` |
| 10  | `src/app/portal/incidents/new/AddIncidentForm.tsx`             | `isPending`                      | `+ \|\| !isOnline` |
| 11  | `src/app/portal/incidents/[id]/edit/EditIncidentForm.tsx`      | `isPending`                      | `+ \|\| !isOnline` |
| 12  | `src/app/portal/guardians/[id]/edit/EditGuardianForm.tsx`      | `isPending`                      | `+ \|\| !isOnline` |

### Phase 6 Tests

**Mock pattern for all form tests:** `vi.mock('@/lib/useOnlineStatus', () => ({ useOnlineStatus: vi.fn() }))`, then control return value per test.

**Existing test files to update** (add "submit button disabled when offline" test):

| #   | Spec file                                                       | Test to add                                |
| --- | --------------------------------------------------------------- | ------------------------------------------ |
| 1   | `src/app/portal/attendance/AttendanceForm.spec.tsx`             | submit disabled when offline               |
| 2   | `src/app/portal/staff-attendance/StaffAttendanceTable.spec.tsx` | sign-in and sign-out disabled when offline |
| 3   | `src/app/portal/students/new/AddStudentForm.spec.tsx`           | submit disabled when offline               |
| 4   | `src/app/portal/students/[id]/edit/EditStudentForm.spec.tsx`    | submit disabled when offline               |

**New test files needed** (these form components currently have no spec):

| #   | New spec file                                                       | Tests                                      |
| --- | ------------------------------------------------------------------- | ------------------------------------------ |
| 5   | `src/app/portal/classes/ClassForm.spec.tsx`                         | renders form, submit disabled when offline |
| 6   | `src/app/portal/staff/new/AddStaffForm.spec.tsx`                    | renders form, submit disabled when offline |
| 7   | `src/app/portal/staff/[id]/edit/EditStaffForm.spec.tsx`             | renders form, submit disabled when offline |
| 8   | `src/app/portal/lesson-plans/new/AddLessonPlanForm.spec.tsx`        | renders form, submit disabled when offline |
| 9   | `src/app/portal/lesson-plans/[id]/edit/EditLessonPlanForm.spec.tsx` | renders form, submit disabled when offline |
| 10  | `src/app/portal/incidents/new/AddIncidentForm.spec.tsx`             | renders form, submit disabled when offline |
| 11  | `src/app/portal/incidents/[id]/edit/EditIncidentForm.spec.tsx`      | renders form, submit disabled when offline |
| 12  | `src/app/portal/guardians/[id]/edit/EditGuardianForm.spec.tsx`      | renders form, submit disabled when offline |

Each test mocks `useOnlineStatus` to return `false`, renders the component, and asserts the submit button has `disabled` attribute.

---

## Phase 7: Disable Sidebar Actions When Offline

**File:** `src/app/portal/_components/PortalSidebar.tsx`

Already a client component. Add `useOnlineStatus()` and disable:

- "Sign out" button: `disabled={!isOnline}` + `opacity-50 cursor-not-allowed`
- "Refresh data" button: `disabled={!isOnline}` + `opacity-50 cursor-not-allowed`
- Add `title="Unavailable while offline"` when `!isOnline`

**New file:** `src/app/portal/_components/PortalSidebar.spec.tsx`

Tests (mock `useOnlineStatus`, `next/navigation`, `next/image`):

- renders nav items from props
- highlights active nav item based on pathname
- "Sign out" button disabled when offline
- "Refresh data" button disabled when offline
- buttons enabled when online

---

## Phase 8: Guard "Add" Links on List Pages

Replace `<Link>` with `<OfflineGuardedLink>` for "Add" buttons on 5 pages:

| #   | File                                                | Link text                      |
| --- | --------------------------------------------------- | ------------------------------ |
| 1   | `src/app/portal/students/page.tsx`                  | "Add student"                  |
| 2   | `src/app/portal/staff/page.tsx`                     | "Add Staff"                    |
| 3   | `src/app/portal/classes/page.tsx`                   | "Add Class"                    |
| 4   | `src/app/portal/incidents/IncidentsClient.tsx`      | "Add incident"                 |
| 5   | `src/app/portal/lesson-plans/LessonPlansClient.tsx` | "New lesson plan" (or similar) |

`OfflineGuardedLink` is a `'use client'` component, so it can be imported from server component pages — SSR renders the Link version, client hydrates with live `navigator.onLine`.

### Phase 8 Tests

**Existing test files to update** (add "Add link disabled when offline" test):

| #   | Spec file                                                | Test to add                                  |
| --- | -------------------------------------------------------- | -------------------------------------------- |
| 1   | `src/app/portal/students/page.spec.tsx`                  | "Add student" link disabled when offline     |
| 2   | `src/app/portal/staff/page.spec.tsx`                     | "Add Staff" link disabled when offline       |
| 3   | `src/app/portal/classes/page.spec.tsx`                   | "Add Class" link disabled when offline       |
| 4   | `src/app/portal/incidents/IncidentsClient.spec.tsx`      | "Add incident" link disabled when offline    |
| 5   | `src/app/portal/lesson-plans/LessonPlansClient.spec.tsx` | "New lesson plan" link disabled when offline |

Each test mocks `useOnlineStatus` to return `false`, renders the page/component, and asserts the "Add" element is a `<span>` (not a link) with tooltip text.

---

## Verification

Run `npm run pipeline:check` after each phase completes.
This runs: lint → format:check → type-check → test:coverage → build.

---

## CLAUDE.md Compliance

- **Explicit return types** on every function
- **No `any`** — use `unknown` and narrow
- **`type` over `interface`**
- **No TODO comments**
- **Test files alongside source** (e.g. `useOnlineStatus.ts` → `useOnlineStatus.spec.ts`)
- **`vi.mock()` / `vi.fn()` / `vi.spyOn()`** — never jest.mock
- **Shared client components** in `src/clientComponents/`
- **Utilities/hooks** in `src/lib/`
- **Run `npm run pipeline:check`** after every change

---

## Files Summary

### New Files (5 components + 14 test files = 19 new files)

| File                                                                | Purpose                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/lib/useOnlineStatus.ts`                                        | Hook: `useSyncExternalStore` for online/offline      |
| `src/lib/useOnlineStatus.spec.ts`                                   | Tests for hook                                       |
| `src/app/portal/_components/OfflineBanner.tsx`                      | Amber banner in layout when offline                  |
| `src/app/portal/_components/OfflineBanner.spec.tsx`                 | Tests for banner                                     |
| `src/app/portal/_components/OfflineNotice.tsx`                      | Inline "saving unavailable" message for forms        |
| `src/app/portal/_components/OfflineNotice.spec.tsx`                 | Tests for notice                                     |
| `src/clientComponents/OfflineGuardedLink.tsx`                       | Link → disabled span when offline                    |
| `src/clientComponents/OfflineGuardedLink.spec.tsx`                  | Tests for guarded link                               |
| `src/app/portal/_components/PortalSidebar.spec.tsx`                 | Tests for sidebar (new — none existed)               |
| `src/app/portal/classes/ClassForm.spec.tsx`                         | Tests for class form (new — none existed)            |
| `src/app/portal/staff/new/AddStaffForm.spec.tsx`                    | Tests for add staff form (new — none existed)        |
| `src/app/portal/staff/[id]/edit/EditStaffForm.spec.tsx`             | Tests for edit staff form (new — none existed)       |
| `src/app/portal/lesson-plans/new/AddLessonPlanForm.spec.tsx`        | Tests for add lesson plan form (new — none existed)  |
| `src/app/portal/lesson-plans/[id]/edit/EditLessonPlanForm.spec.tsx` | Tests for edit lesson plan form (new — none existed) |
| `src/app/portal/incidents/new/AddIncidentForm.spec.tsx`             | Tests for add incident form (new — none existed)     |
| `src/app/portal/incidents/[id]/edit/EditIncidentForm.spec.tsx`      | Tests for edit incident form (new — none existed)    |
| `src/app/portal/guardians/[id]/edit/EditGuardianForm.spec.tsx`      | Tests for edit guardian form (new — none existed)    |

### Modified Files (20 source files + 9 existing test files = 29 modified files)

**Source files:**

| File                                                           | Change                                 |
| -------------------------------------------------------------- | -------------------------------------- |
| `public/portal-sw.js`                                          | Add RSC + JS chunk caching, bump to v4 |
| `src/app/portal/layout.tsx`                                    | Add `<OfflineBanner />`                |
| `src/app/portal/_components/PortalSidebar.tsx`                 | Disable sign-out + refresh offline     |
| `src/app/portal/attendance/AttendanceForm.tsx`                 | Disable submit offline                 |
| `src/app/portal/staff-attendance/StaffAttendanceTable.tsx`     | Disable sign-in/out offline            |
| `src/app/portal/students/new/AddStudentForm.tsx`               | Disable submit offline                 |
| `src/app/portal/students/[id]/edit/EditStudentForm.tsx`        | Disable submit offline                 |
| `src/app/portal/staff/new/AddStaffForm.tsx`                    | Disable submit offline                 |
| `src/app/portal/staff/[id]/edit/EditStaffForm.tsx`             | Disable submit offline                 |
| `src/app/portal/classes/ClassForm.tsx`                         | Disable submit offline                 |
| `src/app/portal/lesson-plans/new/AddLessonPlanForm.tsx`        | Disable submit offline                 |
| `src/app/portal/lesson-plans/[id]/edit/EditLessonPlanForm.tsx` | Disable submit offline                 |
| `src/app/portal/incidents/new/AddIncidentForm.tsx`             | Disable submit offline                 |
| `src/app/portal/incidents/[id]/edit/EditIncidentForm.tsx`      | Disable submit offline                 |
| `src/app/portal/guardians/[id]/edit/EditGuardianForm.tsx`      | Disable submit offline                 |
| `src/app/portal/students/page.tsx`                             | `OfflineGuardedLink` for Add button    |
| `src/app/portal/staff/page.tsx`                                | `OfflineGuardedLink` for Add button    |
| `src/app/portal/classes/page.tsx`                              | `OfflineGuardedLink` for Add button    |
| `src/app/portal/incidents/IncidentsClient.tsx`                 | `OfflineGuardedLink` for Add button    |
| `src/app/portal/lesson-plans/LessonPlansClient.tsx`            | `OfflineGuardedLink` for Add button    |

**Existing test files to update** (add offline-specific assertions):

| File                                                            | New test                                |
| --------------------------------------------------------------- | --------------------------------------- |
| `src/app/portal/attendance/AttendanceForm.spec.tsx`             | submit disabled when offline            |
| `src/app/portal/staff-attendance/StaffAttendanceTable.spec.tsx` | sign-in/out disabled when offline       |
| `src/app/portal/students/new/AddStudentForm.spec.tsx`           | submit disabled when offline            |
| `src/app/portal/students/[id]/edit/EditStudentForm.spec.tsx`    | submit disabled when offline            |
| `src/app/portal/students/page.spec.tsx`                         | "Add student" disabled when offline     |
| `src/app/portal/staff/page.spec.tsx`                            | "Add Staff" disabled when offline       |
| `src/app/portal/classes/page.spec.tsx`                          | "Add Class" disabled when offline       |
| `src/app/portal/incidents/IncidentsClient.spec.tsx`             | "Add incident" disabled when offline    |
| `src/app/portal/lesson-plans/LessonPlansClient.spec.tsx`        | "New lesson plan" disabled when offline |
