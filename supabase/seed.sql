-- ─── E2E Test Seed Data ───────────────────────────────────────────────────────
-- All UUIDs are deterministic so tests can reference them directly.
-- Run via: npx supabase db reset

-- ─── Staff ────────────────────────────────────────────────────────────────────
-- Roles: 1 admin, 2 teachers, 1 headteacher, 1 secretary
INSERT INTO staff (id, email, first_name, last_name, role, contact_number) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@test.hshb.local',       'Alice',   'Admin',      'admin',       '07700000001'),
  ('00000000-0000-0000-0000-000000000002', 'teacher@test.hshb.local',     'Tom',     'Teacher',    'teacher',     '07700000002'),
  ('00000000-0000-0000-0000-000000000003', 'teacher2@test.hshb.local',    'Sarah',   'Teacher',    'teacher',     '07700000003'),
  ('00000000-0000-0000-0000-000000000004', 'headteacher@test.hshb.local', 'Helen',   'Headteacher','headteacher', '07700000004'),
  ('00000000-0000-0000-0000-000000000005', 'secretary@test.hshb.local',   'Sandra',  'Secretary',  'secretary',   '07700000005');

-- ─── Classes ──────────────────────────────────────────────────────────────────
-- Alpha → teacher1, Beta → teacher2, Gamma → headteacher
INSERT INTO classes (id, name, year_group, room_number, teacher_id, academic_year) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Alpha', 'Year 1', 'R1', '00000000-0000-0000-0000-000000000002', '2025-26'),
  ('10000000-0000-0000-0000-000000000002', 'Beta',  'Year 2', 'R2', '00000000-0000-0000-0000-000000000003', '2025-26'),
  ('10000000-0000-0000-0000-000000000003', 'Gamma', 'Year 3', 'R3', '00000000-0000-0000-0000-000000000004', '2025-26');

-- ─── Guardians ────────────────────────────────────────────────────────────────
INSERT INTO guardians (id, first_name, last_name, phone, email) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Gary',  'AliceGuardian', '07711000001', 'gary.alice@example.com'),
  ('20000000-0000-0000-0000-000000000002', 'Grace', 'BobGuardian',   '07711000002', 'grace.bob@example.com'),
  ('20000000-0000-0000-0000-000000000003', 'Greg',  'CarolGuardian', '07711000003', 'greg.carol@example.com');

-- ─── Students ─────────────────────────────────────────────────────────────────
-- Alice + Bob in Alpha, Carol in Beta
INSERT INTO students (id, first_name, last_name, address_line_1, city, postcode,
                      primary_guardian_id, allergies, medical_details) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Alice', 'Student', '1 Test St', 'London', 'N1 1AA',
   '20000000-0000-0000-0000-000000000001', 'Peanuts', 'Asthma'),
  ('30000000-0000-0000-0000-000000000002', 'Bob',   'Student', '2 Test St', 'London', 'N1 1AB',
   '20000000-0000-0000-0000-000000000002', NULL, NULL),
  ('30000000-0000-0000-0000-000000000003', 'Carol', 'Student', '3 Test St', 'London', 'N1 1AC',
   '20000000-0000-0000-0000-000000000003', NULL, NULL);

-- ─── Student Classes ──────────────────────────────────────────────────────────
INSERT INTO student_classes (id, student_id, class_id) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'), -- Alice → Alpha
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'), -- Bob   → Alpha
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002'); -- Carol → Beta

-- ─── Timetable Slots ──────────────────────────────────────────────────────────
INSERT INTO timetable_slots (id, class_id, day_of_week, start_time, end_time, subject) VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Saturday', '10:00', '11:00', 'Maths'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Saturday', '11:00', '12:00', 'Greek'),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Sunday',   '10:00', '11:00', 'History');

-- ─── Incidents ────────────────────────────────────────────────────────────────
INSERT INTO incidents (id, type, student_id, title, description, incident_date, created_by) VALUES
  ('60000000-0000-0000-0000-000000000001', 'medical',   '30000000-0000-0000-0000-000000000001',
   'Allergic reaction', 'Alice had a mild allergic reaction in class.', NOW() - INTERVAL '2 days',
   '00000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000002', 'behaviour', '30000000-0000-0000-0000-000000000002',
   'Disruptive in class', 'Bob was disruptive during the lesson.', NOW() - INTERVAL '1 day',
   '00000000-0000-0000-0000-000000000002');

-- ─── Lesson Plans ─────────────────────────────────────────────────────────────
INSERT INTO lesson_plans (id, class_id, lesson_date, description, created_by) VALUES
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   CURRENT_DATE, 'Introduction to addition and subtraction.',
   '00000000-0000-0000-0000-000000000002');
