-- ─── Staff ────────────────────────────────────────────────────────────────────
-- Admins add staff here before they can log in via Microsoft SSO.

CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  display_name    TEXT,                -- optional override; if null, use first_name || ' ' || last_name
  role            TEXT NOT NULL CHECK (role IN ('teacher', 'admin', 'headteacher')),
  contact_number  TEXT,
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
  -- Student's own address
  address_line_1          TEXT NOT NULL,
  address_line_2          TEXT,
  city                    TEXT NOT NULL,
  postcode                TEXT NOT NULL,
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

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Access is enforced in the application layer (Next.js) using the service role
-- key, so RLS is enabled but permissive for the service role.

ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians        ENABLE ROW LEVEL SECURITY;
ALTER TABLE students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance       ENABLE ROW LEVEL SECURITY;

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
