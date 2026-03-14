-- Migration: Add parent notification fields to incidents table
-- Run this in the Supabase SQL editor against the existing database.

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS parent_notified    BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parent_notified_at TIMESTAMPTZ;
