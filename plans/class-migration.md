# End-of-Year Class Migration

## Context

At the end of each academic year, the admin needs to migrate classes: create a new class for the next year, move all students from the old class into it, and deactivate the old class. This is a once-a-year admin-only task that currently has no UI. The database already supports this — classes have `active` (boolean) and `academic_year` fields, and the `student_classes` junction table handles enrollment.

## Approach

Add a new admin-only page at `/portal/class-migration` that:

1. Lets admin select a source (active) class from a dropdown
2. Shows the students in that class (read-only confirmation)
3. Collects new class details (name, year group, room, academic year, teacher)
4. On submit: creates the new class, enrolls all source students, deactivates the old class

Uses URL search params (`?sourceClassId=...`) for source class selection — matching the attendance page pattern for server-side data fetching on selection change.

## CLAUDE.md Compliance

All code must adhere to these rules throughout implementation:

- **Explicit return types** on every function (TypeScript rule)
- **No `any` types** — use `unknown` and narrow, or use concrete types
- **`type` over `interface`** unless extending
- **Test file per source file** — `.spec.ts` / `.spec.tsx` alongside source
- **Vitest only** — use `vi.mock()`, `vi.spyOn()`, `vi.fn()` — never `jest.mock()`
- **React Testing Library** for component tests
- **Mock `@/db` exports** in action tests (matching existing action test pattern)
- **No TODO comments** — implement or skip
- **Verify Supabase schema via MCP** before writing any queries (already done — no new queries needed, all reuse existing verified functions)
- **No new DB queries inline in components** — all DB access through `src/db/`
- **Client component placement**: `ClassMigrationForm.tsx` lives alongside its page (matches `ClassForm.tsx`, `AttendanceFilters.tsx` pattern for page-specific client components)
- **Run `npm run pipeline:check`** after every change — fix all failures before proceeding

## Files to Create

### 1. `src/app/portal/class-migration/page.tsx` — Server Page

- Auth check → `canMigrateClasses(role)` → redirect if unauthorized
- Read `searchParams.sourceClassId`
- Fetch `getAllClasses()` + `getTeachers()`
- If sourceClassId set: also fetch `getStudentsByClass(sourceClassId)`
- Pass all data to `ClassMigrationForm` client component
- All functions with explicit return types (`Promise<ReactNode>` for page)

### 2. `src/app/portal/class-migration/ClassMigrationForm.tsx` — Client Form

- `'use client'` with `useState`, `useTransition`, `useRouter`
- All props and helper types defined with `type` (not `interface`)
- All functions with explicit return types
- **Section 1 — Source Class**: dropdown of active classes. On change → `router.push(?sourceClassId=...)`. Shows read-only student list when source selected.
- **Section 2 — New Class Details**: name, year_group, room_number, academic_year, teacher_id (all matching existing field styling from `ClassForm.tsx`)
- Hidden `source_class_id` field
- Submit button "Migrate Class", cancel link, error display
- Same `handleSubmit` pattern as `ClassForm.tsx`

### 3. `src/app/portal/class-migration/actions.ts` — Server Action

```
migrateClassAction(formData: FormData): Promise<ActionResult>
```

1. Auth + `canMigrateClasses` check
2. Validate with `migrateClassSchema`
3. `getClassById(sourceId)` → verify exists and active, get student IDs
4. `createClass(newClassData)` → create new class
5. `setClassStudents(newClassId, studentIds)` → enroll students
6. `updateClass(sourceId, { active: false })` → deactivate old class
7. `logAuditEvent(...)` + `revalidatePath`
8. `redirect('/portal/class-migration')`

**No new DB functions needed** — reuses existing `getClassById`, `createClass`, `setClassStudents`, `updateClass` from `src/db/classes.ts`.

### 4. `src/app/portal/class-migration/actions.spec.ts` — Action Tests

- Mock pattern: `vi.mock('@/auth', ...)`, `vi.mock('@/db', ...)`, `vi.mock('next/cache', ...)`, `vi.mock('next/navigation', ...)`
- Use `vi.mocked()` for type-safe mock assertions (matching existing test pattern)
- `makeFormData` helper with explicit return type
- Tests: unauthenticated, unauthorized (teacher role), validation error, source not found, source already inactive, successful migration (verify all 3 DB calls + audit + revalidate), DB error returns user-friendly message

### 5. `src/app/portal/class-migration/ClassMigrationForm.spec.tsx` — Form Tests

- Use `@testing-library/react` with `render`, `screen`, `fireEvent`
- Mock `next/navigation` (`useRouter`, `useTransition`)
- Tests: renders source class dropdown, renders new class fields when source selected, shows student list, calls action on submit, displays error from action result

### 6. `src/app/portal/class-migration/loading.tsx` — Loading Skeleton

- `animate-pulse` skeleton matching form layout
- Explicit return type on default export

## Files to Modify

### 1. `src/lib/permissions.ts` — Add permission

```typescript
export function canMigrateClasses(role: StaffRole): boolean {
  return role === 'admin'
}
```

### 2. `src/lib/schemas.ts` — Add validation schema

```typescript
export const migrateClassSchema = z.object({
  source_class_id: uuid,
  name: requiredString,
  year_group: requiredString,
  room_number: optionalString,
  academic_year: optionalString,
  teacher_id: uuid,
})
```

### 3. `src/app/portal/layout.tsx` — Add nav item

- Import `ArrowPathRoundedSquareIcon` from `@heroicons/react/24/outline`
- Import `canMigrateClasses` from `@/lib/permissions`
- Add nav item with `filter: canMigrateClasses` (admin-only visibility)

### 4. `src/app/portal/_components/PortalSidebar.tsx` — Add icon mapping

- Import `ArrowPathRoundedSquareIcon` from `@heroicons/react/24/outline`
- Add `'/portal/class-migration': ArrowPathRoundedSquareIcon` to `iconMap`

## Verification

1. Run `npm run pipeline:check` after every file change — must pass lint, format, types, tests, build
2. Fix all failures immediately before proceeding to next file
3. Manual: log in as admin → see "Class Migration" nav item
4. Manual: select source class → confirm students shown
5. Manual: fill new class details → submit → verify old class inactive, new class created with students
6. Manual: log in as teacher → confirm nav item hidden
