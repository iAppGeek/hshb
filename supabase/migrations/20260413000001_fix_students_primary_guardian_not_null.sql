-- ─── Fix: students.primary_guardian_id should be NOT NULL ────────────────────
--
-- schema.sql declares primary_guardian_id as NOT NULL, but the live production
-- column is nullable. This happened because the column was added to the table
-- via ALTER TABLE (ordinal position 24 vs the original ~11 in the schema), and
-- the NOT NULL constraint was never applied at that time.
--
-- Every student must have a primary guardian — this is a business rule enforced
-- in the application layer. The missing NOT NULL constraint means the database
-- does not enforce this independently, which is a data-integrity gap.
--
-- Safe to run: verify no existing NULL values first (query below), then apply.
-- If any NULLs are found they must be resolved before this migration can run.
--
--   SELECT id, first_name, last_name FROM students WHERE primary_guardian_id IS NULL;
--

ALTER TABLE students ALTER COLUMN primary_guardian_id SET NOT NULL;
