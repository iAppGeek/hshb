-- ─── Staff ────────────────────────────────────────────────────────────────────
-- Admins add staff here before they can log in via Microsoft SSO.

CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  display_name    TEXT,                -- optional override; if null, use first_name || ' ' || last_name
  role            TEXT NOT NULL CHECK (role IN ('teacher', 'admin', 'headteacher', 'secretary')),
  contact_number  TEXT,
  personal_email  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Classes ──────────────────────────────────────────────────────────────────

CREATE TABLE classes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  year_group    TEXT NOT NULL,
  room_number   TEXT,
  teacher_id    UUID REFERENCES staff(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Guardians ────────────────────────────────────────────────────────────────
-- Reusable guardian/contact records. Students link to these via FK.

CREATE TABLE guardians (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  address_line_1  TEXT,
  address_line_2  TEXT,
  city            TEXT,
  postcode        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Keep updated_at current on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guardians_updated_at
  BEFORE UPDATE ON guardians
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Students ─────────────────────────────────────────────────────────────────
-- student_code preserves existing spreadsheet IDs for import/reference.
-- Each student must have a primary guardian; secondary guardian and two
-- additional contacts are optional and also reference the guardians table.
-- Class enrolment is managed via student_classes (many-to-many).

CREATE TABLE students (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code            TEXT UNIQUE,                          -- existing spreadsheet ID
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  date_of_birth           DATE,
  -- Student's own address (nullable when address_guardian_id is set)
  address_line_1          TEXT,
  address_line_2          TEXT,
  city                    TEXT,
  postcode                TEXT,
  -- Guardian whose address this student shares (alternative to own address)
  address_guardian_id     UUID REFERENCES guardians(id) ON DELETE SET NULL,
  -- Guardian links with relationship to student
  primary_guardian_id           UUID NOT NULL REFERENCES guardians(id) ON DELETE RESTRICT,
  primary_guardian_relationship TEXT,
  secondary_guardian_id         UUID REFERENCES guardians(id) ON DELETE SET NULL,
  secondary_guardian_relationship TEXT,
  additional_contact_1_id       UUID REFERENCES guardians(id) ON DELETE SET NULL,
  additional_contact_1_relationship TEXT,
  additional_contact_2_id       UUID REFERENCES guardians(id) ON DELETE SET NULL,
  additional_contact_2_relationship TEXT,
  -- Medical
  allergies               TEXT,
  medical_details         TEXT,
  enrollment_date         DATE DEFAULT CURRENT_DATE,
  active                  BOOLEAN NOT NULL DEFAULT TRUE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE students
  ADD CONSTRAINT students_address_source_check CHECK (
    address_guardian_id IS NOT NULL
    OR (address_line_1 IS NOT NULL AND city IS NOT NULL AND postcode IS NOT NULL)
  );

-- ─── Student Classes ──────────────────────────────────────────────────────────
-- Junction table: a student can be enrolled in multiple classes.

CREATE TABLE student_classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, class_id)
);

-- ─── Timetable ────────────────────────────────────────────────────────────────

CREATE TABLE timetable_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week  TEXT NOT NULL CHECK (day_of_week IN (
                 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
               )),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  subject      TEXT,
  room         TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Attendance ───────────────────────────────────────────────────────────────
-- One record per student per date. status: present | absent | late
-- UNIQUE(student_id, date) means upsert on conflict updates the existing row.

CREATE TABLE attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  notes        TEXT,
  recorded_by  UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, date)
);

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Incidents ────────────────────────────────────────────────────────────────

CREATE TABLE incidents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('medical', 'behaviour', 'other')),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  created_by          UUID NOT NULL REFERENCES staff(id),
  updated_by          UUID REFERENCES staff(id),
  parent_notified     BOOLEAN NOT NULL DEFAULT FALSE,
  parent_notified_at  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Push Subscriptions ───────────────────────────────────────────────────────
-- Stores Web Push API subscriptions per staff member (one row per device).
-- endpoint is UNIQUE: re-subscribing the same device upserts cleanly.
-- No role column — role is joined from staff at query time so promotions propagate automatically.

CREATE TABLE push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON push_subscriptions (staff_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Access is enforced in the application layer (Next.js) using the service role
-- key, so RLS is enabled but permissive for the service role.

ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians        ENABLE ROW LEVEL SECURITY;
ALTER TABLE students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically — no policy needed for server-side queries.
-- Add restrictive policies here if you ever expose these tables via the anon key.

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX ON guardians (last_name);
CREATE INDEX ON students (student_code);
CREATE INDEX ON students (active);
CREATE INDEX ON students (primary_guardian_id);
CREATE INDEX ON students (secondary_guardian_id);
CREATE INDEX ON student_classes (student_id);
CREATE INDEX ON student_classes (class_id);
CREATE INDEX ON classes (teacher_id);
CREATE INDEX ON classes (active);
CREATE INDEX ON timetable_slots (class_id);
CREATE INDEX ON timetable_slots (day_of_week);
CREATE INDEX ON attendance (class_id, date);
CREATE INDEX ON attendance (student_id);
CREATE INDEX ON incidents (student_id);
CREATE INDEX ON incidents (type);
CREATE INDEX ON incidents (incident_date DESC);


-- ─── Lesson Plans ───────────────────────────────────────────────────────────
-- One lesson plan per class per calendar day.

CREATE TABLE lesson_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  lesson_date   DATE NOT NULL,
  description   TEXT NOT NULL,
  created_by    UUID NOT NULL REFERENCES staff(id),
  updated_by    UUID REFERENCES staff(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, lesson_date)
);

CREATE TRIGGER lesson_plans_updated_at
  BEFORE UPDATE ON lesson_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE INDEX ON lesson_plans (lesson_date DESC);
CREATE INDEX ON lesson_plans (class_id);

-- ─── Staff Attendance ─────────────────────────────────────────────────────────
-- One record per staff member per date. signed_in_at is user-provided (not auto
-- NOW()) so admins can backfill accurate arrival times for past dates.
-- signed_out_at is nullable: NULL means currently signed in.

CREATE TABLE staff_attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  signed_in_at    TIMESTAMPTZ NOT NULL,
  signed_out_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, date)
);

CREATE TRIGGER staff_attendance_updated_at
  BEFORE UPDATE ON staff_attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE INDEX ON staff_attendance (staff_id);
CREATE INDEX ON staff_attendance (date);

-- ─── Functions ────────────────────────────────────────────────────────────────

-- Aggregates attendance records for a given date by class.
-- Returns present count, earliest created_at, and latest updated_at per class.
CREATE OR REPLACE FUNCTION get_attendance_summary(p_date DATE)
RETURNS TABLE(
  class_id        UUID,
  present_count   BIGINT,
  min_created_at  TIMESTAMPTZ,
  max_updated_at  TIMESTAMPTZ
) AS $$
  SELECT
    class_id,
    COUNT(*) FILTER (WHERE status IN ('present', 'late')) AS present_count,
    MIN(created_at)  AS min_created_at,
    MAX(updated_at)  AS max_updated_at
  FROM attendance
  WHERE date = p_date
  GROUP BY class_id
$$ LANGUAGE sql STABLE;

-- Migrates a class to a new academic year: creates a new class with the given
-- details, copies all student enrolments from the source class, and deactivates
-- the source class — all in a single atomic transaction.
CREATE OR REPLACE FUNCTION migrate_class(
  p_source_class_id  UUID,
  p_name             TEXT,
  p_year_group       TEXT,
  p_room_number      TEXT,
  p_academic_year    TEXT,
  p_teacher_id       UUID
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  v_source       RECORD;
  v_new_class_id UUID;
BEGIN
  -- Verify source class exists and is active
  SELECT id, active INTO v_source FROM classes WHERE id = p_source_class_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source class not found';
  END IF;
  IF NOT v_source.active THEN
    RAISE EXCEPTION 'Source class is already inactive';
  END IF;

  -- Create new class
  INSERT INTO classes (name, year_group, room_number, academic_year, teacher_id, active)
  VALUES (p_name, p_year_group, p_room_number, p_academic_year, p_teacher_id, true)
  RETURNING id INTO v_new_class_id;

  -- Enrol all students from source class into new class
  INSERT INTO student_classes (student_id, class_id)
  SELECT student_id, v_new_class_id
  FROM student_classes
  WHERE class_id = p_source_class_id;

  -- Deactivate source class
  UPDATE classes SET active = false WHERE id = p_source_class_id;

  RETURN json_build_object('new_class_id', v_new_class_id);

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Class name "%" already exists for this academic year', p_name;
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Invalid teacher or student reference — a record may have been deleted';
  WHEN check_violation THEN
    RAISE EXCEPTION 'Invalid data for class creation — check required fields';
END;
$$;

-- ─── Audit Log ───────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID REFERENCES staff(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_log_staff_id ON audit_log(staff_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
