-- Migration: Add 'other' as a valid incident type
-- Run this in the Supabase SQL editor against the existing database.

ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_type_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_type_check
  CHECK (type IN ('medical', 'behaviour', 'other'));
