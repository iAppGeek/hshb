-- ─── Fix: remove duplicate indexes on students.primary/secondary_guardian_id ──
--
-- The students table has two indexes for each of primary_guardian_id and
-- secondary_guardian_id. These were created at different points in the project:
--
--   students_primary_guardian_idx     ← older (created without the _id_ suffix)
--   students_primary_guardian_id_idx  ← newer (matches current schema.sql convention)
--
--   students_secondary_guardian_idx     ← older
--   students_secondary_guardian_id_idx  ← newer
--
-- Both indexes in each pair cover the exact same column with no difference in
-- expression or predicate, so one of each is entirely redundant. Duplicate
-- indexes waste storage and slow down writes (INSERT / UPDATE / DELETE) because
-- PostgreSQL must maintain all indexes on every write.
--
-- The _id_idx variants are kept because they match the naming convention used
-- throughout the rest of the schema (e.g. students_active_idx, etc.).
--

DROP INDEX IF EXISTS students_primary_guardian_idx;
DROP INDEX IF EXISTS students_secondary_guardian_idx;
