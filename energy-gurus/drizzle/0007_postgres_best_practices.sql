-- Migration: PostgreSQL & Supabase Best Practices
-- Safe, idempotent migration (no breaking changes to existing data or queries)

-- 1. UTC updated_at trigger function & triggers
CREATE OR REPLACE FUNCTION public.set_updated_at_utc()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('UTC', now());
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl text;
  tables_with_updated_at text[] := ARRAY[
    'users',
    'epc_installers',
    'epc_projects',
    'brands',
    'products',
    'inquiries',
    'monitoring_requests',
    'installer_certifications',
    'brand_certifications',
    'podcasts',
    'live_qa',
    'writer_profiles',
    'news',
    'ads'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_updated_at LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'updated_at'
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_set_updated_at_utc ON public.%I;', tbl, tbl);
      EXECUTE format(
        'CREATE TRIGGER trg_%I_set_updated_at_utc BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_utc();',
        tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- 2. Partial indexes for hot filtered queries (faster reads, smaller index footprint)
CREATE INDEX IF NOT EXISTS epc_installers_live_created_idx
  ON public.epc_installers (created_at DESC)
  WHERE status = 'live';

CREATE INDEX IF NOT EXISTS brands_live_created_idx
  ON public.brands (created_at DESC)
  WHERE status = 'live';

CREATE INDEX IF NOT EXISTS news_published_idx
  ON public.news (published_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS ads_active_placement_idx
  ON public.ads (placement, target_page)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS users_active_role_idx
  ON public.users (role)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS inquiries_new_receiver_idx
  ON public.inquiries (receiver_id, created_at DESC)
  WHERE status = 'new';

-- 3. CHECK constraints for enum-like text columns (idempotent & non-breaking)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('super-admin', 'admin', 'epc', 'brand', 'writer', 'user')) NOT VALID;
    ALTER TABLE public.users VALIDATE CONSTRAINT users_role_check;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'epc_installers_status_check') THEN
    ALTER TABLE public.epc_installers
      ADD CONSTRAINT epc_installers_status_check
      CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'live', 'rejected')) NOT VALID;
    ALTER TABLE public.epc_installers VALIDATE CONSTRAINT epc_installers_status_check;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'epc_installers_tier_check') THEN
    ALTER TABLE public.epc_installers
      ADD CONSTRAINT epc_installers_tier_check
      CHECK (tier IN ('unverified', 'bronze', 'silver', 'gold', 'diamond', 'platinum')) NOT VALID;
    ALTER TABLE public.epc_installers VALIDATE CONSTRAINT epc_installers_tier_check;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brands_status_check') THEN
    ALTER TABLE public.brands
      ADD CONSTRAINT brands_status_check
      CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'live', 'rejected')) NOT VALID;
    ALTER TABLE public.brands VALIDATE CONSTRAINT brands_status_check;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'writer_profiles_status_check') THEN
    ALTER TABLE public.writer_profiles
      ADD CONSTRAINT writer_profiles_status_check
      CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected')) NOT VALID;
    ALTER TABLE public.writer_profiles VALIDATE CONSTRAINT writer_profiles_status_check;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_status_check') THEN
    ALTER TABLE public.news
      ADD CONSTRAINT news_status_check
      CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'published', 'rejected')) NOT VALID;
    ALTER TABLE public.news VALIDATE CONSTRAINT news_status_check;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'developer_logs_log_type_check') THEN
    ALTER TABLE public.developer_logs
      ADD CONSTRAINT developer_logs_log_type_check
      CHECK (log_type IN ('activity', 'user_activity', 'error')) NOT VALID;
    ALTER TABLE public.developer_logs VALIDATE CONSTRAINT developer_logs_log_type_check;
  END IF;
END $$;

-- 4. RLS-respecting Views (security_invoker = true enforces caller RLS policies)
CREATE OR REPLACE VIEW public.v_live_epc_installers
WITH (security_invoker = true) AS
SELECT *
FROM public.epc_installers
WHERE status = 'live';

CREATE OR REPLACE VIEW public.v_live_brands
WITH (security_invoker = true) AS
SELECT *
FROM public.brands
WHERE status = 'live';

CREATE OR REPLACE VIEW public.v_published_news
WITH (security_invoker = true) AS
SELECT *
FROM public.news
WHERE is_published = true;
