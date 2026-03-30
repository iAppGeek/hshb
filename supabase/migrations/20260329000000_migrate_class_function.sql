CREATE OR REPLACE FUNCTION migrate_class(
  p_source_class_id UUID,
  p_name TEXT,
  p_year_group TEXT,
  p_room_number TEXT,
  p_academic_year TEXT,
  p_teacher_id UUID
) RETURNS JSON AS $$
DECLARE
  v_source RECORD;
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

  -- Enroll all students from source class into new class
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
$$ LANGUAGE plpgsql;
