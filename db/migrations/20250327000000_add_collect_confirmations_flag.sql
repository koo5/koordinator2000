-- Migration: Add Collect Confirmations Flag
-- Created at: 2025-03-27T00:00:00.000Z

-- This migration adds a collect_confirmations flag to campaigns table to make confirmations optional

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20250327000000');
END $$;

-- Save the campaigns table structure before modification
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    EXECUTE format('CREATE TABLE _migration_backup_%s.campaigns AS SELECT * FROM public.campaigns', '20250327000000');
  END IF;
END $$;

-- Add collect_confirmations column to campaigns table with default value of false
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS collect_confirmations BOOLEAN DEFAULT false NOT NULL;

-- Update only campaign with ID 11 to have collect_confirmations set to true
UPDATE public.campaigns SET collect_confirmations = true WHERE id = 11;