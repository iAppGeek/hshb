-- ─── Staff ────────────────────────────────────────────────────────────────────
-- Admins add staff here before they can log in via Microsoft SSO.

CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
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
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Students ─────────────────────────────────────────────────────────────────
-- student_code preserves existing spreadsheet IDs for import/reference.
-- emergency_contacts is JSONB: [{ name, relationship, phone }, ...] (max 3)

CREATE TABLE students (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code            TEXT UNIQUE,                          -- existing spreadsheet ID
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  date_of_birth           DATE,
  class_id                UUID REFERENCES classes(id) ON DELETE SET NULL,
  -- Primary parent / guardian
  primary_parent_name     TEXT,
  primary_parent_email    TEXT,
  primary_parent_phone    TEXT,
  -- Secondary parent / guardian
  secondary_parent_name   TEXT,
  secondary_parent_email  TEXT,
  secondary_parent_phone  TEXT,
  -- Emergency contacts (up to 3, stored as JSON array)
  emergency_contacts      JSONB NOT NULL DEFAULT '[]',
  -- Medical
  allergies               TEXT,
  enrollment_date         DATE DEFAULT CURRENT_DATE,
  active                  BOOLEAN NOT NULL DEFAULT TRUE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Keep updated_at current on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Access is enforced in the application layer (Next.js) using the service role
-- key, so RLS is enabled but permissive for the service role.

ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically — no policy needed for server-side queries.
-- Add restrictive policies here if you ever expose these tables via the anon key.

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX ON students (class_id);
CREATE INDEX ON students (student_code);
CREATE INDEX ON students (active);
CREATE INDEX ON classes (teacher_id);
CREATE INDEX ON timetable_slots (class_id);
CREATE INDEX ON timetable_slots (day_of_week);
