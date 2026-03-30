# Plan: Student Address Guardian Reference

## Context

When adding/editing a student, staff need an option to indicate the student lives at the same address as one of their guardians. Instead of duplicating address data, the student will **reference** a guardian's address — single source of truth, no sync issues.

**Current state:** Students have required address fields (`address_line_1`, `city`, `postcode`). Guardians have optional address fields. No link between them.

**Goal:** Student either has their own address **OR** points to a guardian whose address they share.

---

## Approach

Add an `address_guardian_id` FK column on `students` referencing `guardians(id)`. Make the student's own address fields nullable. When `address_guardian_id` is set, the student's address is read from that guardian. When null, the student uses their own address fields.

Scope: Primary & secondary guardians only (not additional contacts).

---

## Steps

### 1. Database Migration

Add column and relax NOT NULL constraints on student address fields:

```sql
ALTER TABLE students
  ADD COLUMN address_guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL;

ALTER TABLE students
  ALTER COLUMN address_line_1 DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN postcode DROP NOT NULL;

ALTER TABLE students
  ADD CONSTRAINT students_address_source_check CHECK (
    address_guardian_id IS NOT NULL
    OR (address_line_1 IS NOT NULL AND city IS NOT NULL AND postcode IS NOT NULL)
  );
```

Update `supabase/schema.sql` to match.

### 2. Regenerate TypeScript Types

Run `gentypes` skill to regenerate `src/types/database.ts`.

### 3. Update DB Layer

- **`src/db/students.ts`**: Add `address_guardian_id` to `StudentInsert` and `StudentUpdate` types.
- **`src/db/students.ts`**: Update `STUDENT_SELECT` and `STUDENT_SELECT_WITH_TEACHER` to also select the `address_guardian` relationship (similar to existing guardian joins) so we can resolve the address in a single query:
  ```
  address_guardian:guardians!students_address_guardian_id_fkey(
    address_line_1, address_line_2, city, postcode
  )
  ```

### 4. Add Address Resolver Utility

Create a helper in `src/lib/student-address.ts`:

```typescript
type AddressSource = {
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
}

export function resolveStudentAddress(student: {
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
  address_guardian?: AddressSource | null
}): AddressSource {
  if (student.address_guardian) return student.address_guardian
  return {
    address_line_1: student.address_line_1,
    address_line_2: student.address_line_2,
    city: student.city,
    postcode: student.postcode,
  }
}
```

**File:** `src/lib/student-address.ts` (new), `src/lib/student-address.spec.ts` (new)

### 5. Update Validation Schemas

**File:** `src/lib/schemas.ts`

- Add `address_guardian_id` (optional UUID) to `studentBaseSchema`
- Make `student_address_line_1`, `student_city`, `student_postcode` optional (they're required only when `address_guardian_id` is not set — validate this with a `.refine()`)
- Add refinement: if `address_guardian_id` is empty/null, then address fields are required

### 6. Update Form UI — AddStudentForm

**File:** `src/app/portal/students/new/AddStudentForm.tsx`

- Add state: `const [addressMode, setAddressMode] = useState<'own' | 'guardian'>('own')`
- Add a toggle in the Student Details section (below address fields): radio buttons "Enter address" / "Same as guardian"
- When "Same as guardian" is selected:
  - Hide the 4 address input fields
  - Show a dropdown to pick which guardian (populated from the already-selected primary/secondary guardians on the form)
  - Add hidden input `address_guardian_id` with the selected guardian's ID
  - The dropdown should only show guardians that have been selected (existing) or are being created (new — in which case we need to handle this: the guardian doesn't have an ID yet)
- **Edge case — new guardian:** If the user picks "Same as guardian" and the guardian is being created inline (mode: "new"), the server action must create the guardian first, then use that ID as `address_guardian_id`. This is already the flow — guardians are resolved before student creation.
- Add hidden input: `<input type="hidden" name="address_guardian_id" value={selectedGuardianSlot} />`
  - Value should indicate which slot ("primary" or "secondary") rather than a UUID, since the guardian may not exist yet. The server action resolves the slot to an ID.

### 7. Update Form UI — EditStudentForm

**File:** `src/app/portal/students/[id]/edit/EditStudentForm.tsx`

- Same toggle as AddStudentForm
- Pre-populate: if `student.address_guardian_id` is set, default to "Same as guardian" mode and pre-select the matching guardian slot
- Pass `address_guardian_id` in the student data type

### 8. Update Server Actions

**File:** `src/app/portal/students/new/actions.ts`

- After resolving all guardian IDs, check if `address_guardian_id` slot is set
- Map slot name ("primary" / "secondary") to the resolved guardian ID
- Pass `address_guardian_id` to `createStudent()`
- When `address_guardian_id` is set, pass `null` for student address fields

**File:** `src/app/portal/students/[id]/edit/actions.ts`

- Same pattern for update

### 9. Update Display Components

**File:** `src/components/StudentDetailsModal.tsx`

- Use `resolveStudentAddress()` helper to get the address
- The modal already handles null addresses gracefully (checks existence before rendering)
- If address comes from guardian, optionally show a small label "(from guardian: Name)"

### 10. Guardian Address Validation

When a student references a guardian for address, that guardian must have address fields filled in. Add validation:

- In server actions: when `address_guardian_id` resolves to a guardian, verify the guardian has `address_line_1`, `city`, `postcode` filled in
- In the form: when "Same as guardian" is selected and the guardian is being created new inline, make the guardian's address fields required (pass a prop to `GuardianFields`)

---

## Files to Modify

| File                                                    | Change                                              |
| ------------------------------------------------------- | --------------------------------------------------- |
| `supabase/schema.sql`                                   | Add column, relax constraints, add CHECK            |
| `src/types/database.ts`                                 | Regenerate                                          |
| `src/db/students.ts`                                    | Add `address_guardian_id` to types + queries        |
| `src/lib/schemas.ts`                                    | Make address conditional, add `address_guardian_id` |
| `src/lib/student-address.ts`                            | **New** — address resolver utility                  |
| `src/app/portal/students/new/AddStudentForm.tsx`        | Address mode toggle + guardian picker               |
| `src/app/portal/students/new/actions.ts`                | Resolve guardian slot to ID for address             |
| `src/app/portal/students/[id]/edit/EditStudentForm.tsx` | Same toggle + pre-populate                          |
| `src/app/portal/students/[id]/edit/actions.ts`          | Same resolution logic                               |
| `src/components/StudentDetailsModal.tsx`                | Use `resolveStudentAddress()`                       |

## New Test Files

| File                                                | Tests                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/student-address.spec.ts`                   | `resolveStudentAddress` with own address, with guardian ref, with null |
| `src/lib/schemas.spec.ts`                           | Update existing tests for conditional address validation               |
| `src/app/portal/students/new/actions.spec.ts`       | Update for `address_guardian_id` flow                                  |
| `src/app/portal/students/[id]/edit/actions.spec.ts` | Update for `address_guardian_id` flow                                  |

## Verification

1. Run `npm run pipeline:check` after all changes
2. Create a student with own address — verify address displays correctly
3. Create a student with "Same as guardian" (existing guardian) — verify address resolves from guardian
4. Create a student with "Same as guardian" (new inline guardian) — verify guardian created first, then linked
5. Edit a student — toggle between own address and guardian address, verify save works
6. Edit the linked guardian's address — verify student's displayed address updates (no copy, it's a reference)
7. Delete scenario: if linked guardian is deleted, `ON DELETE SET NULL` clears the reference — student would need address re-entered (CHECK constraint would fail on next save, prompting the user)
