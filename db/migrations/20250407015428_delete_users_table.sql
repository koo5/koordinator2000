-- Migration: delete_users_table
-- Created at: 2025-04-07T01:54:28.002Z

-- This migration will drop the users table which is not being used
-- and has no direct dependencies in the database

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20250407015428');
END $$;

-- Save the users table before dropping it (for possible rollback)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE format('CREATE TABLE _migration_backup_%s.users AS SELECT * FROM public.users', '20250407015428');
  END IF;
END $$;

-- First, drop the trigger on the users table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_users_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_public_users_updated_at ON public.users;
  END IF;
END $$;

-- Now drop the users table
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    DROP TABLE public.users;
  END IF;
END $$;