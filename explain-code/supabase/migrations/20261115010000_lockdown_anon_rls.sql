-- ============================================================================
-- Migration: 20261115010000_lockdown_anon_rls.sql
-- ปิดสิทธิ์การเข้าถึงตารางข้อมูลผู้ใช้และผลการเรียนโดยตรงผ่าน anon/authenticated key
-- (ทุก Route Handler ฝั่ง Server ใช้ SUPABASE_SERVICE_ROLE_KEY ซึ่ง bypass RLS อยู่แล้ว)
-- ============================================================================

-- 1. เปิด RLS บนทุกตารางสำคัญ (กันกรณีบางตารางยังไม่ได้เปิด)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempt_cell_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_badges ENABLE ROW LEVEL SECURITY;

-- 2. ลบ Policy ที่เปิดกว้าง (FOR ALL USING (true)) จาก migration ก่อนหน้า
DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_teachers" ON public.teachers;
DROP POLICY IF EXISTS "allow_all_classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "allow_all_students" ON public.students;
DROP POLICY IF EXISTS "allow_all_activity_days" ON public.activity_days;
DROP POLICY IF EXISTS "allow_all_attempts" ON public.attempts;
DROP POLICY IF EXISTS "allow_all_attempt_cell_scores" ON public.attempt_cell_scores;
DROP POLICY IF EXISTS "allow_all_attempt_answers" ON public.attempt_answers;
DROP POLICY IF EXISTS "allow_all_topic_progress" ON public.topic_progress;
DROP POLICY IF EXISTS "allow_all_student_badges" ON public.student_badges;

-- 3. ลบสิทธิ์อ่าน/เขียนตรงจาก role anon และ authenticated บนตารางที่มี hash ลับ
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.teachers FROM anon, authenticated;
REVOKE ALL ON TABLE public.students FROM anon, authenticated;
