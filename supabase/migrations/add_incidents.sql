-- Migration: Add incidents table
-- Run this in the Supabase SQL editor against the existing database.

CREATE TABLE IF NOT EXISTS incidents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('medical', 'behaviour', 'other')),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  created_by    UUID NOT NULL REFERENCES staff(id),
  updated_by    UUID REFERENCES staff(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_incidents_student_id    ON incidents(student_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type          ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON incidents(incident_date DESC);
