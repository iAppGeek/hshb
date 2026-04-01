# Bulk Email for Staff, Students & Classes

## Context

The portal has no email infrastructure. Staff need to send bulk communications to:

- All staff (school email, personal email, or both)
- A class's guardians (following per-student contact preferences)
- All students' guardians (same contact logic)

Currently, guardians don't have a `receive_emails` opt-in field, additional contacts don't have emails fetched in queries, and there's no email service dependency.

Key constraints: Netlify 10-26s function timeout, Resend batch API supports 100/call, so 150 recipients = 2 calls (well within timeout). Email send logic must be extracted for future reuse (e.g. emailing a class from the attendance page).

---

## Phase 1: Schema & Infrastructure

### 1a. Database migration

Add three `receive_emails` boolean columns to `students` table (NOT guardians — a guardian can be primary for one student and secondary for another, so the opt-in is per-relationship):

```sql
ALTER TABLE students
  ADD COLUMN secondary_guardian_receives_emails BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN additional_contact_1_receives_emails BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN additional_contact_2_receives_emails BOOLEAN NOT NULL DEFAULT FALSE;
```

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_guardian_email_preferences.sql`

After applying, regenerate types via Supabase MCP `generate_typescript_types`.

### 1b. Install Resend

```bash
npm install resend
```

### 1c. Environment variables

**File:** `env.d.ts` — add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

### 1d. Email service module (reusable)

**New file:** `src/lib/email.ts`

- `server-only` import
- Resend client instantiation
- `sendBulkEmails(payload: { to: string[]; subject: string; body: string; replyTo?: string }): Promise<{ sent: number; failed: number }>` — chunks into batches of 100, calls `resend.batch.send()` for each, aggregates results
- `wrapInTemplate(body: string): string` — wraps plain text in a simple branded HTML email template with escaped content
- Extracted and reusable — any future feature (attendance page, incidents) can import `sendBulkEmails`

**Test file:** `src/lib/email.spec.ts`

### 1e. Permissions

**File:** `src/lib/permissions.ts`

Add:

- `canSendBulkEmails(role)` → `admin || headteacher || secretary`
- Update `canAccessAdminTasks(role)` → `admin || headteacher || secretary` (broadened so any user who can see at least one tab can access the page; individual tabs still check their own permissions)

**File:** `src/lib/permissions.spec.ts` — add tests for new functions, update existing `canAccessAdminTasks` tests

---

## Phase 2: Student Form Updates

### 2a. Update student DB queries

**File:** `src/db/students.ts`

- Add the 3 new `receive_emails` columns to `StudentInsert` and `StudentUpdate` types
- Add `email` to `additional_contact_1` and `additional_contact_2` selects in `STUDENT_SELECT` and `STUDENT_SELECT_WITH_TEACHER` (currently they only fetch `first_name, last_name, phone`)

### 2b. Update student Zod schemas

**File:** `src/lib/schemas.ts`

Add to `studentBaseSchema`:

- `secondary_guardian_receives_emails: booleanFromString` (default `'false'`)
- `additional_contact_1_receives_emails: booleanFromString`
- `additional_contact_2_receives_emails: booleanFromString`

### 2c. Update student create form & action

**Files:**

- `src/app/portal/students/new/AddStudentForm.tsx` — add "Receives emails" checkbox next to secondary guardian and each additional contact section
- `src/app/portal/students/new/actions.ts` — pass the 3 new fields through to `createStudent()`

### 2d. Update student edit form & action

**Files:**

- `src/app/portal/students/[id]/edit/EditStudentForm.tsx` — same checkboxes, defaulting to current values
- `src/app/portal/students/[id]/edit/actions.ts` — pass the 3 new fields through to `updateStudent()`

---

## Phase 3: Email Recipient Queries

**New file:** `src/db/email-recipients.ts`

These are NOT cached (freshness matters, used once per send):

1. **`getStaffEmailRecipients(target: 'school' | 'personal' | 'both')`**
   - `school`: returns `email` for all staff
   - `personal`: returns `personal_email` where not null
   - `both`: returns both, deduplicates
   - Returns `{ emails: string[]; skipped: { name: string; reason: string }[] }`

2. **`getGuardianEmailsByClass(classId: string)`**
   - Joins `student_classes` → `students` → `guardians`
   - Primary guardian email: ALWAYS included
   - Secondary guardian email: only if `secondary_guardian_receives_emails = true`
   - Additional contact 1/2 email: only if their `_receives_emails` flag is true
   - Deduplicates emails across students (same guardian for siblings)
   - Returns `{ emails: string[]; skipped: { name: string; reason: string }[] }`

3. **`getGuardianEmailsForAllStudents()`**
   - Same logic, no class filter, only active students

**Export from:** `src/db/index.ts`

**Test file:** `src/db/email-recipients.spec.ts`

---

## Phase 4: API Route

**New file:** `src/app/api/email/send/route.ts`

```
POST /api/email/send
```

**Request body** (validated by Zod schema in `src/lib/schemas.ts`):

```typescript
{
  type: 'all-staff' | 'class' | 'all-students'
  classId?: string           // required when type === 'class'
  staffEmailTarget?: 'school' | 'personal' | 'both'  // required when type === 'all-staff'
  subject: string            // max 200 chars
  body: string               // max 5000 chars
}
```

**Response:**

```typescript
{
  sent: number
  failed: number
  skipped: {
    name: string
    reason: string
  }
  ;[]
}
```

**Flow:**

1. `auth()` check → 401 if unauthenticated
2. `canSendBulkEmails(role)` → 403 if forbidden
3. Zod-validate request body → 400 on failure
4. Build recipient list via `email-recipients.ts` functions
5. Call `sendBulkEmails()` from `src/lib/email.ts`
6. `logAuditEvent()` with type, subject, recipient count, skipped names
7. Return result

**Zod schema** (`bulkEmailSchema` in schemas.ts):

- Refinement: `classId` required when `type === 'class'`
- Refinement: `staffEmailTarget` required when `type === 'all-staff'`

**Test file:** `src/app/api/email/send/route.spec.ts` — mock auth, db, email module

---

## Phase 5: UI — Bulk Email Tab in Admin Tasks

### 5a. Update Admin page permissions

**File:** `src/app/portal/admin/page.tsx`

- Change permission check from `canAccessAdminTasks` to the updated (broadened) version
- Add `BulkEmailTab` rendering when `tab === 'bulk-email'`
- Fetch `getAllClasses()` for the class dropdown (only when bulk-email tab is active)

### 5b. Update AdminTabBar

**File:** `src/app/portal/admin/_components/AdminTabBar.tsx`

- Accept `role` prop to conditionally show tabs
- Class Migration: visible only to admin (`canMigrateClasses`)
- Bulk Email: visible to admin, headteacher, secretary (`canSendBulkEmails`)

### 5c. Create BulkEmailTab (server component wrapper)

**New file:** `src/app/portal/admin/_tabs/bulk-email/BulkEmailTab.tsx`

- Fetches classes for the dropdown
- Renders `BulkEmailForm` client component

### 5d. Create BulkEmailForm (client component)

**New file:** `src/clientComponents/BulkEmailForm.tsx`

Layout:

1. **Recipient type** — radio group: "All Staff" / "A Class" / "All Students"
2. **Staff email target** (shown only for "All Staff") — radio: "School email" / "Personal email" / "Both"
3. **Class selector** (shown only for "A Class") — dropdown of active classes
4. **Subject** — text input, required, max 200 chars
5. **Message** — textarea, required, max 5000 chars, with character count
6. **Send button** — shows spinner during send, disabled when form is incomplete
7. **Result banner** — green for success ("X emails sent"), amber for skipped recipients with names/reasons

Uses `fetch('/api/email/send', ...)` with loading state via `useState`.

**Test file:** `src/clientComponents/BulkEmailForm.spec.tsx`

### 5e. Update tests

- `src/app/portal/admin/page.spec.tsx` — update for new tab, broadened permissions
- `src/app/portal/admin/_components/AdminTabBar.spec.tsx` — test tab visibility per role

---

## 150 Email Address Feasibility

**Yes, this works.** Resend's batch API accepts up to 100 recipients per call. For 150 addresses:

- Split into 2 batch calls (100 + 50)
- Each call completes in 1-3 seconds
- Total: well within Netlify's 10-26 second timeout
- `sendBulkEmails` handles chunking automatically
- Deduplication happens before batching (same guardian for siblings → one email)

---

## Files Summary

### New files

| File                                                                   | Purpose                       |
| ---------------------------------------------------------------------- | ----------------------------- |
| `supabase/migrations/..._add_guardian_email_preferences.sql`           | Schema migration              |
| `src/lib/email.ts` + `.spec.ts`                                        | Reusable Resend email service |
| `src/db/email-recipients.ts` + `.spec.ts`                              | Recipient list queries        |
| `src/app/api/email/send/route.ts` + `.spec.ts`                         | API route                     |
| `src/app/portal/admin/_tabs/bulk-email/BulkEmailTab.tsx` + `.spec.tsx` | Server tab wrapper            |
| `src/clientComponents/BulkEmailForm.tsx` + `.spec.tsx`                 | Client compose form           |
| `src/lib/schemas.ts`                                                   | `bulkEmailSchema` (addition)  |

### Modified files

| File                                                    | Change                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `env.d.ts`                                              | Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`                                 |
| `package.json`                                          | Add `resend` dependency                                                   |
| `src/types/database.ts`                                 | Regenerated                                                               |
| `src/db/students.ts`                                    | Add 3 columns to selects/types, add `email` to additional contact selects |
| `src/db/index.ts`                                       | Export email-recipients                                                   |
| `src/lib/schemas.ts`                                    | Add `receive_emails` fields to student schema, add `bulkEmailSchema`      |
| `src/lib/permissions.ts`                                | Add `canSendBulkEmails`, broaden `canAccessAdminTasks`                    |
| `src/app/portal/admin/page.tsx`                         | Add bulk-email tab rendering, broadened permission                        |
| `src/app/portal/admin/_components/AdminTabBar.tsx`      | Role-based tab visibility                                                 |
| `src/app/portal/students/new/AddStudentForm.tsx`        | Receives emails checkboxes                                                |
| `src/app/portal/students/new/actions.ts`                | Pass new fields                                                           |
| `src/app/portal/students/[id]/edit/EditStudentForm.tsx` | Receives emails checkboxes                                                |
| `src/app/portal/students/[id]/edit/actions.ts`          | Pass new fields                                                           |

---

## Verification

1. Run `npm run pipeline:check` — must pass lint, format, types, tests, build
2. Apply migration and verify columns in Supabase via MCP `execute_sql`
3. Manually test in Resend test mode (no real email delivery)
4. Test with mock data: staff send (school/personal/both), class send, all students send
5. Verify deduplication: same guardian linked to 2 students → only 1 email
6. Verify skipped reporting: guardian with no email → appears in skipped list
7. Verify audit log: bulk email sends appear in audit_log table
