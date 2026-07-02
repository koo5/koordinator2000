-- Migration: Remove participation confirmations
-- Created at: 2026-07-02T00:00:00.000Z
--
-- The "participation confirmations" feature (a separate confirm-after-notice step)
-- does not fit the critical-mass / threshold model, so it is being removed.
-- Drops three columns:
--   participations.confirmed
--   campaign_notifications.confirmed
--   campaigns.collect_confirmations

-- Back up the affected tables so this migration can be rolled back.
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20260702000000');
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'participations') THEN
    EXECUTE 'CREATE TABLE _migration_backup_20260702000000.participations AS SELECT * FROM public.participations';
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaign_notifications') THEN
    EXECUTE 'CREATE TABLE _migration_backup_20260702000000.campaign_notifications AS SELECT * FROM public.campaign_notifications';
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    EXECUTE 'CREATE TABLE _migration_backup_20260702000000.campaigns AS SELECT * FROM public.campaigns';
  END IF;
END $$;

ALTER TABLE public.participations DROP COLUMN IF EXISTS confirmed;
ALTER TABLE public.campaign_notifications DROP COLUMN IF EXISTS confirmed;
ALTER TABLE public.campaigns DROP COLUMN IF EXISTS collect_confirmations;
