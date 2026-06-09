-- ═══════════════════════════════════════════════════════════════
-- QA Nexus AI — Supabase Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  email        TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. PROJECTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL,
  description            TEXT,
  status                 TEXT NOT NULL DEFAULT 'Not Started'
                           CHECK (status IN ('Not Started','In Progress','Under Review','Completed')),
  priority               TEXT NOT NULL DEFAULT 'Medium'
                           CHECK (priority IN ('Critical','High','Medium','Low')),
  total_story_points     INTEGER NOT NULL DEFAULT 0,
  remaining_story_points INTEGER NOT NULL DEFAULT 0,
  start_date             TIMESTAMPTZ,
  target_date            TIMESTAMPTZ,
  tags                   TEXT[],
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx  ON public.projects(status);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 3. TEST SUITES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_suites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS test_suites_project_id_idx ON public.test_suites(project_id);

ALTER TABLE public.test_suites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage suites in own projects"
  ON public.test_suites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = test_suites.project_id
        AND projects.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS test_suites_updated_at ON public.test_suites;
CREATE TRIGGER test_suites_updated_at
  BEFORE UPDATE ON public.test_suites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. TEST CASES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_cases (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suite_id          UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  steps             TEXT[] NOT NULL DEFAULT '{}',
  expected_result   TEXT NOT NULL DEFAULT '',
  automation_status TEXT NOT NULL DEFAULT 'Manual'
                      CHECK (automation_status IN ('Manual','Automated')),
  priority          TEXT NOT NULL DEFAULT 'Medium'
                      CHECK (priority IN ('Critical','High','Medium','Low')),
  generated_code    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS test_cases_suite_id_idx ON public.test_cases(suite_id);

ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage test cases in own suites"
  ON public.test_cases FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.test_suites ts
      JOIN public.projects p ON p.id = ts.project_id
      WHERE ts.id = test_cases.suite_id
        AND p.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS test_cases_updated_at ON public.test_cases;
CREATE TRIGGER test_cases_updated_at
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. ACTIVITY LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_log_user_id_idx    ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS activity_log_project_id_idx ON public.activity_log(project_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 6. HELPER VIEWS
-- ─────────────────────────────────────────────────────────────

-- Project summary with suite + test case counts
CREATE OR REPLACE VIEW public.project_summary AS
SELECT
  p.*,
  COUNT(DISTINCT ts.id)  AS suite_count,
  COUNT(DISTINCT tc.id)  AS test_case_count,
  COUNT(DISTINCT tc.id) FILTER (WHERE tc.automation_status = 'Automated') AS automated_count,
  COUNT(DISTINCT tc.id) FILTER (WHERE tc.automation_status = 'Manual')    AS manual_count
FROM public.projects p
LEFT JOIN public.test_suites ts ON ts.project_id = p.id
LEFT JOIN public.test_cases  tc ON tc.suite_id   = ts.id
GROUP BY p.id;

-- ═══════════════════════════════════════════════════════════════
-- Migration complete ✓
-- ═══════════════════════════════════════════════════════════════
