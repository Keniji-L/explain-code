-- ============================================================================
-- Migration: Revoke anon/authenticated REST access & enforce RLS on all
-- remaining application tables and analytical views.
-- Notes:
--   - All application database reads/writes execute exclusively through
--     Next.js server API routes using Supabase service_role (getSupabaseAdmin).
--   - Enabling RLS with no permissive policies + revoking anon/authenticated
--     privileges prevents direct PostgREST exposure while keeping service_role intact.
--   - Safe and idempotent to run repeatedly in Supabase SQL Editor.
-- ============================================================================

DO $$
DECLARE
  tbl text;
  vw text;
  rel_kind char;
  pol record;
  target_tables text[] := ARRAY[
    'profiles',
    'teachers',
    'students',
    'classrooms',
    'topics',
    'block_cells',
    'badges',
    'attempts',
    'attempt_cell_scores',
    'attempt_answers',
    'ai_evaluations',
    'ai_usage_logs',
    'topic_progress',
    'student_badges',
    'activity_days',
    'code_explanations',
    'courses',
    'lessons',
    'enrollments',
    'lesson_progress',
    'dungeon_questions',
    'dungeon_runs',
    'room_attempts',
    'player_stats',
    'items',
    'user_items',
    'achievements',
    'user_achievements',
    'user_dungeon_saves',
    'user_custom_dungeons'
  ];
  target_views text[] := ARRAY[
    'student_stats',
    'student_cell_latest',
    'student_streaks',
    'classroom_cell_avg',
    'classroom_question_stats',
    'view_public_dungeon_questions',
    'view_dungeon_leaderboard'
  ];
BEGIN
  -- 1. Lock down all base tables: enable RLS, drop permissive policies, revoke REST privileges
  FOREACH tbl IN ARRAY target_tables LOOP
    SELECT c.relkind
      INTO rel_kind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = tbl;

    IF rel_kind IN ('r', 'p') THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

      FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, tbl);
      END LOOP;

      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC;', tbl);
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon;', tbl);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated;', tbl);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role;', tbl);
      END IF;
    END IF;
  END LOOP;

  -- 2. Lock down all views: set security_invoker = true and revoke anon/authenticated privileges
  FOREACH vw IN ARRAY target_views LOOP
    SELECT c.relkind
      INTO rel_kind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = vw;

    IF rel_kind = 'v' THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true);', vw);
      EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC;', vw);
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM anon;', vw);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM authenticated;', vw);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        EXECUTE format('GRANT SELECT ON public.%I TO service_role;', vw);
      END IF;
    ELSIF rel_kind = 'm' THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC;', vw);
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM anon;', vw);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM authenticated;', vw);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        EXECUTE format('GRANT SELECT ON public.%I TO service_role;', vw);
      END IF;
    END IF;
  END LOOP;
END
$$;
